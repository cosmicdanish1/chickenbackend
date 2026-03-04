import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { PurchaseOrder } from '../purchases/entities/purchase-order.entity';
import { Vehicle } from '../vehicles/vehicle.entity';

@Entity('mortality_records')
export class MortalityRecord {
  @PrimaryGeneratedColumn('increment', { type: 'bigint' })
  id!: string;

  @Column({ name: 'record_number', type: 'varchar', length: 50, unique: true })
  recordNumber!: string;

  @Column({ name: 'purchase_invoice_no', type: 'varchar', length: 50, nullable: true })
  purchaseInvoiceNo?: string;

  @Column({ name: 'purchase_order_id', type: 'bigint', nullable: true })
  purchaseOrderId?: string;

  @ManyToOne(() => PurchaseOrder, { nullable: true })
  @JoinColumn({ name: 'purchase_order_id' })
  purchaseOrder?: PurchaseOrder;

  @Column({ name: 'vehicle_id', type: 'bigint', nullable: true })
  vehicleId?: string;

  @ManyToOne(() => Vehicle, { nullable: true })
  @JoinColumn({ name: 'vehicle_id' })
  vehicle?: Vehicle;

  @Column({ name: 'mortality_date', type: 'date' })
  mortalityDate!: string;

  @Column({ name: 'number_of_birds_died', type: 'integer' })
  numberOfBirdsDied!: number;

  @Column({ name: 'reason', type: 'text', nullable: true })
  reason?: string;

  @Column({ name: 'notes', type: 'text', nullable: true })
  notes?: string;

  @Column({ name: 'created_at', type: 'timestamptz', default: () => 'NOW()' })
  createdAt!: Date;

  @Column({ name: 'updated_at', type: 'timestamptz', default: () => 'NOW()' })
  updatedAt!: Date;
}
