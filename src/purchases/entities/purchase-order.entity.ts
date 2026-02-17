import { Column, Entity, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { PurchaseOrderItem } from './purchase-order-item.entity';

export type PurchaseStatus = 'pending' | 'received' | 'cancelled';

@Entity({ name: 'purchase_orders' })
export class PurchaseOrder {
  @PrimaryGeneratedColumn('increment', { type: 'bigint' })
  id!: string;

  @Column({ name: 'order_number', type: 'varchar', length: 50, unique: true })
  orderNumber!: string;

  @Column({ name: 'supplier_name', type: 'varchar', length: 150 })
  supplierName!: string;

  @Column({ name: 'order_date', type: 'date' })
  orderDate!: string;

  @Column({ name: 'due_date', type: 'date', nullable: true })
  dueDate?: string;

  @Column({
    type: 'enum',
    enum: ['pending', 'received', 'cancelled'],
    enumName: 'purchase_status',
    default: 'pending',
  })
  status!: PurchaseStatus;

  @Column({ name: 'total_amount', type: 'numeric', precision: 14, scale: 2, default: 0 })
  totalAmount!: number;

  @Column({ type: 'text', nullable: true })
  notes?: string;

  @OneToMany(() => PurchaseOrderItem, (item) => item.purchaseOrder, { cascade: true })
  items!: PurchaseOrderItem[];

  @Column({ name: 'created_at', type: 'timestamptz', default: () => 'NOW()' })
  createdAt!: Date;

  @Column({ name: 'updated_at', type: 'timestamptz', default: () => 'NOW()' })
  updatedAt!: Date;
}