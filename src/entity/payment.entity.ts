import { AbstractEntity } from './abstract.entity';
import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

import { Booking } from './booking.entity';
import { PromotionCode } from './promotion-code.entity';
import { PaymentPurpose, PaymentSource, PaymentStatus } from '../enums/payment.enum';
import { PaymentFpx } from './payment-fpx.entity';

@Entity('payments')
export class Payment extends AbstractEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ManyToOne((type) => Booking, (booking) => booking.id)
    booking: Booking;

    @Column({ type: 'datetime', nullable: true })
    paidOn: Date;

    @Column({ type: 'float', nullable: false })
    initialAmount: number;

    @Column({ type: 'float', nullable: false })
    amount: number;

    @Column({ type: 'float', nullable: true })
    proratedAmount?: number;

    @Column({ type: 'varchar', length: 3, default: 'MYR' })
    currency: string;

    @Column({ type: 'enum', enum: PaymentStatus })
    status: PaymentStatus;

    @Column({ type: 'enum', enum: PaymentPurpose })
    purpose: PaymentPurpose;

    @Column({ type: 'enum', enum: PaymentSource, nullable: true })
    source: PaymentSource;

    @Column({ type: 'datetime', nullable: true })
    dueDate: Date;

    @Column({ type: 'boolean', default: false })
    lateCharge: boolean;

    @Column({ type: 'float', default: 0 })
    lateChargeAmount: number;

    @Column({ type: 'float', default: 0 })
    discountAmount: number;

    @ManyToOne((type) => PromotionCode, (promotionCode) => promotionCode.id, { nullable: true })
    promotionCode: PromotionCode;

    @Column({ type: 'json', nullable: true })
    promotionDump: object;

    @OneToMany(() => PaymentFpx, (paymentFpx) => paymentFpx.payment)
    paymentFpxs?: PaymentFpx[];

    @Column({ type: 'boolean', nullable: false, default: false })
    isProrated: boolean;
}

@Entity()
export class PaymentMandate extends AbstractEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ManyToOne((type) => Payment, (payment) => payment.id)
    payment: Payment;

    @Column({ type: 'varchar', length: 20, unique: true })
    referenceCode: string;

    @Column({ type: 'boolean', default: false })
    enrollmentComplete: boolean;

    @Column({ type: 'float' })
    maxAmount: number;

    @Column({ type: 'enum', enum: PaymentStatus })
    status: PaymentStatus;

    @Column({ type: 'json', nullable: true })
    response: object;

    @Column({ type: 'varchar', nullable: true })
    responseMessage: string;
}

@Entity()
export class PaymentCollection extends AbstractEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ManyToOne((type) => Payment, (payment) => payment.id)
    payment: Payment;

    @ManyToOne((type) => PaymentMandate, (paymentMandate) => paymentMandate.id)
    paymentMandate: PaymentMandate;

    @Column({ type: 'datetime', nullable: true })
    collectionDate: Date;

    @Column({ type: 'float', nullable: false })
    amount: number;

    @Column({ type: 'enum', enum: PaymentStatus })
    status: PaymentStatus;

    @Column({ type: 'json', nullable: true })
    response: object;

    @Column({ type: 'varchar', length: '255', nullable: true })
    batch: string;
}

@Entity()
export class PaymentCollectionStatus extends AbstractEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ManyToOne((type) => PaymentCollection, (paymentCollection) => paymentCollection.id)
    paymentCollection: PaymentCollection;

    @Column({ type: 'varchar', length: '10', nullable: true })
    curlecStatusCode: string;

    @Column({ type: 'varchar', length: '255', nullable: true })
    curlecStatusMessage: string;

    @Column({ type: 'json', nullable: true })
    response: object;
}
