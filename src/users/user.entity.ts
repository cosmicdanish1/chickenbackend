import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

export type UserRole = 'admin' | 'manager' | 'staff';
export type UserStatus = 'active' | 'inactive';

@Entity({ name: 'users' })
export class User {
  @PrimaryGeneratedColumn('increment', { type: 'bigint' })
  id!: string;

  @Column({ type: 'varchar', length: 100 })
  name!: string;

  @Column({ type: 'citext', unique: true })
  email!: string;

  @Column({ name: 'password_hash', type: 'text' })
  passwordHash!: string;

  @Column({
    type: 'enum',
    enum: ['admin', 'manager', 'staff'],
    enumName: 'user_role',
    default: 'manager',
  })
  role!: UserRole;

  @Column({
    type: 'enum',
    enum: ['active', 'inactive'],
    enumName: 'user_status',
    default: 'active',
  })
  status!: UserStatus;

  @Column({ name: 'join_date', type: 'date', default: () => 'CURRENT_DATE' })
  joinDate!: string;

  @Column({ name: 'last_login', type: 'timestamptz', nullable: true })
  lastLogin?: Date | null;

  @Column({ name: 'created_at', type: 'timestamptz', default: () => 'NOW()' })
  createdAt!: Date;

  @Column({ name: 'updated_at', type: 'timestamptz', default: () => 'NOW()' })
  updatedAt!: Date;
}

