import { Column, Entity, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Retailer } from '../retailers/retailer.entity';

export type SaleProductType = 'eggs' | 'meat' | 'chicks' | 'other';
export type PaymentStatusType = 'paid' | 'pending' | 'partial';

@Entity({ name: 'sales' })
export class Sale {
  @PrimaryGeneratedColumn('increment', { type: 'bigint' })
  id!: string;

  @Column({ name: 'invoice_number', type: 'varchar', length: 50, unique: true })
  invoiceNumber!: string;

  @Column({ name: 'customer_name', type: 'varchar', length: 150 })
  customerName!: string;

  @Column({ name: 'sale_date', type: 'date' })
  saleDate!: string;

  @Column({
    name: 'product_type',
    type: 'enum',
    enum: ['eggs', 'meat', 'chicks', 'other'],
    enumName: 'sale_product_type',
  })
  productType!: SaleProductType;

  @Column({ type: 'numeric', precision: 14, scale: 2 })
  quantity!: number;

  @Column({ type: 'varchar', length: 20, nullable: true })
  unit?: string;

  @Column({ name: 'unit_price', type: 'numeric', precision: 14, scale: 2 })
  unitPrice!: number;

  @Column({ name: 'total_amount', type: 'numeric', precision: 14, scale: 2 })
  totalAmount!: number;

  @Column({
    name: 'payment_status',
    type: 'enum',
    enum: ['paid', 'pending', 'partial'],
    enumName: 'payment_status_type',
    default: 'pending',
  })
  paymentStatus!: PaymentStatusType;

  @Column({ name: 'amount_received', type: 'numeric', precision: 14, scale: 2, default: 0 })
  amountReceived!: number;

  @Column({ type: 'text', nullable: true })
  notes?: string;

  @Column({ name: 'retailer_id', type: 'bigint', nullable: true })
  retailerId?: string;

  @ManyToOne(() => Retailer, { nullable: true })
  @JoinColumn({ name: 'retailer_id' })
  retailer?: Retailer;

  @Column({ name: 'created_at', type: 'timestamptz', default: () => 'NOW()' })
  createdAt!: Date;

  @Column({ name: 'updated_at', type: 'timestamptz', default: () => 'NOW()' })
  updatedAt!: Date;
}