const { Client } = require('pg');
const fs = require('fs');

const connectionString = 'postgresql://poultry_user:tdgOrBo0kxdJNDIphGaP3m1PBmzE0IpZ@dpg-d6a8cskr85hc738ep8fg-a.oregon-postgres.render.com:5432/poultry_4xcy';

async function exportCompleteSchema() {
  const client = new Client({ 
    connectionString,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log('✅ Connected to Render database\n');

    // Get all custom types
    console.log('📊 Fetching custom types...');
    const typesResult = await client.query(`
      SELECT 
        t.typname as type_name,
        array_agg(e.enumlabel ORDER BY e.enumsortorder) as enum_values
      FROM pg_type t 
      LEFT JOIN pg_enum e ON t.oid = e.enumtypid  
      LEFT JOIN pg_catalog.pg_namespace n ON n.oid = t.typnamespace
      WHERE n.nspname = 'public'
        AND t.typtype = 'e'
      GROUP BY t.typname
      ORDER BY t.typname;
    `);

    // Get all tables
    console.log('📊 Fetching tables...');
    const tablesResult = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
        AND table_type = 'BASE TABLE'
      ORDER BY table_name;
    `);

    let sqlContent = `-- ============================================
-- COMPLETE DATABASE SCHEMA
-- Poultry Management System
-- Generated from Render PostgreSQL Database
-- Date: ${new Date().toISOString().split('T')[0]}
-- ============================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS citext;

-- ============================================
-- DROP EXISTING TABLES (in reverse dependency order)
-- ============================================

`;

    // Add drop statements
    const tables = tablesResult.rows.map(r => r.table_name);
    for (const table of tables.reverse()) {
      sqlContent += `DROP TABLE IF EXISTS ${table} CASCADE;\n`;
    }
    tables.reverse(); // Restore original order

    sqlContent += `\n-- ============================================
-- DROP CUSTOM TYPES
-- ============================================

`;

    for (const type of typesResult.rows) {
      sqlContent += `DROP TYPE IF EXISTS ${type.type_name} CASCADE;\n`;
    }

    sqlContent += `\n-- ============================================
-- CREATE CUSTOM TYPES
-- ============================================

`;

    for (const type of typesResult.rows) {
      const values = Array.isArray(type.enum_values) 
        ? type.enum_values.map(v => `'${v}'`).join(', ')
        : type.enum_values.replace(/[{}]/g, '').split(',').map(v => `'${v}'`).join(', ');
      sqlContent += `CREATE TYPE ${type.type_name} AS ENUM (${values});\n\n`;
    }

    sqlContent += `-- ============================================
-- CREATE TABLES
-- ============================================

`;

    // Get detailed schema for each table
    for (const table of tables) {
      console.log(`📄 Processing table: ${table}`);
      
      // Get columns
      const columnsResult = await client.query(`
        SELECT 
          column_name,
          data_type,
          character_maximum_length,
          numeric_precision,
          numeric_scale,
          is_nullable,
          column_default,
          udt_name
        FROM information_schema.columns
        WHERE table_name = $1
        ORDER BY ordinal_position;
      `, [table]);

      // Get primary key
      const pkResult = await client.query(`
        SELECT a.attname
        FROM pg_index i
        JOIN pg_attribute a ON a.attrelid = i.indrelid AND a.attnum = ANY(i.indkey)
        WHERE i.indrelid = $1::regclass AND i.indisprimary;
      `, [table]);

      // Get unique constraints
      const uniqueResult = await client.query(`
        SELECT a.attname
        FROM pg_index i
        JOIN pg_attribute a ON a.attrelid = i.indrelid AND a.attnum = ANY(i.indkey)
        WHERE i.indrelid = $1::regclass AND i.indisunique AND NOT i.indisprimary;
      `, [table]);

      // Get foreign keys
      const fkResult = await client.query(`
        SELECT
          kcu.column_name,
          ccu.table_name AS foreign_table_name,
          ccu.column_name AS foreign_column_name,
          rc.delete_rule
        FROM information_schema.table_constraints AS tc
        JOIN information_schema.key_column_usage AS kcu
          ON tc.constraint_name = kcu.constraint_name
        JOIN information_schema.constraint_column_usage AS ccu
          ON ccu.constraint_name = tc.constraint_name
        JOIN information_schema.referential_constraints AS rc
          ON rc.constraint_name = tc.constraint_name
        WHERE tc.constraint_type = 'FOREIGN KEY' AND tc.table_name = $1;
      `, [table]);

      // Get indexes
      const indexResult = await client.query(`
        SELECT indexname, indexdef
        FROM pg_indexes
        WHERE tablename = $1 AND indexname NOT LIKE '%_pkey';
      `, [table]);

      const pkColumns = pkResult.rows.map(r => r.attname);
      const uniqueColumns = uniqueResult.rows.map(r => r.attname);
      const fkMap = {};
      fkResult.rows.forEach(fk => {
        fkMap[fk.column_name] = {
          table: fk.foreign_table_name,
          column: fk.foreign_column_name,
          onDelete: fk.delete_rule
        };
      });

      sqlContent += `\n-- Table: ${table}\n`;
      sqlContent += `CREATE TABLE ${table} (\n`;

      const columnDefs = [];
      for (const col of columnsResult.rows) {
        let def = `    ${col.column_name} `;
        
        // Data type
        if (col.data_type === 'USER-DEFINED') {
          def += col.udt_name;
        } else if (col.data_type === 'character varying') {
          def += `VARCHAR(${col.character_maximum_length || 255})`;
        } else if (col.data_type === 'numeric') {
          def += `DECIMAL(${col.numeric_precision},${col.numeric_scale})`;
        } else if (col.data_type === 'bigint' && col.column_default && col.column_default.includes('nextval')) {
          def += 'BIGSERIAL';
        } else {
          def += col.data_type.toUpperCase();
        }

        // Primary key
        if (pkColumns.includes(col.column_name)) {
          def += ' PRIMARY KEY';
        }

        // Unique
        if (uniqueColumns.includes(col.column_name)) {
          def += ' UNIQUE';
        }

        // Not null
        if (col.is_nullable === 'NO' && !pkColumns.includes(col.column_name)) {
          def += ' NOT NULL';
        }

        // Default
        if (col.column_default && !col.column_default.includes('nextval')) {
          if (col.column_default.includes('now()') || col.column_default.includes('CURRENT_')) {
            def += ` DEFAULT ${col.column_default.split('::')[0]}`;
          } else {
            def += ` DEFAULT ${col.column_default}`;
          }
        }

        // Foreign key
        if (fkMap[col.column_name]) {
          const fk = fkMap[col.column_name];
          def += ` REFERENCES ${fk.table}(${fk.column})`;
          if (fk.onDelete !== 'NO ACTION') {
            def += ` ON DELETE ${fk.onDelete.replace('_', ' ')}`;
          }
        }

        columnDefs.push(def);
      }

      sqlContent += columnDefs.join(',\n');
      sqlContent += '\n);\n';

      // Add indexes
      if (indexResult.rows.length > 0) {
        sqlContent += `\n-- Indexes for ${table}\n`;
        for (const idx of indexResult.rows) {
          sqlContent += `${idx.indexdef};\n`;
        }
      }
    }

    sqlContent += `\n-- ============================================
-- VERIFICATION QUERIES
-- ============================================

-- List all tables
SELECT table_name, 
       (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = t.table_name) as column_count
FROM information_schema.tables t
WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
ORDER BY table_name;

-- List all custom types
SELECT typname as type_name
FROM pg_type 
WHERE typnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')
  AND typtype = 'e'
ORDER BY typname;
`;

    // Write to file
    fs.writeFileSync('./migrations/COMPLETE_SCHEMA.sql', sqlContent);
    console.log('\n✅ Complete schema exported to: BackEnd/migrations/COMPLETE_SCHEMA.sql');

    // Export table info for Mermaid diagram
    const tableInfo = {};
    for (const table of tables) {
      const columnsResult = await client.query(`
        SELECT 
          column_name,
          data_type,
          udt_name,
          is_nullable,
          column_default
        FROM information_schema.columns
        WHERE table_name = $1
        ORDER BY ordinal_position;
      `, [table]);

      const pkResult = await client.query(`
        SELECT a.attname
        FROM pg_index i
        JOIN pg_attribute a ON a.attrelid = i.indrelid AND a.attnum = ANY(i.indkey)
        WHERE i.indrelid = $1::regclass AND i.indisprimary;
      `, [table]);

      const fkResult = await client.query(`
        SELECT
          kcu.column_name,
          ccu.table_name AS foreign_table_name,
          ccu.column_name AS foreign_column_name
        FROM information_schema.table_constraints AS tc
        JOIN information_schema.key_column_usage AS kcu
          ON tc.constraint_name = kcu.constraint_name
        JOIN information_schema.constraint_column_usage AS ccu
          ON ccu.constraint_name = tc.constraint_name
        WHERE tc.constraint_type = 'FOREIGN KEY' AND tc.table_name = $1;
      `, [table]);

      tableInfo[table] = {
        columns: columnsResult.rows,
        primaryKeys: pkResult.rows.map(r => r.attname),
        foreignKeys: fkResult.rows
      };
    }

    fs.writeFileSync('./table-info.json', JSON.stringify(tableInfo, null, 2));
    console.log('✅ Table info exported to: BackEnd/table-info.json');

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
  } finally {
    await client.end();
    console.log('\n🔌 Database connection closed');
  }
}

exportCompleteSchema();
