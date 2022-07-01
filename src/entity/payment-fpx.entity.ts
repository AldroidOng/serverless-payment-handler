import { AbstractEntity } from './abstract.entity';
import { PaymentStatus } from 'src/enums/payment.enum';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

import { Payment } from './payment.entity';


@Entity('payment_fpxes')
export class PaymentFpx extends AbstractEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'varchar', length: 25, unique: true })
    referenceCode: string;

    @ManyToOne((type) => Payment, (payment) => payment.id)
    payment: Payment;

    @Column({ type: 'enum', enum: PaymentStatus })
    status: PaymentStatus;

    @Column({ type: 'json', nullable: true })
    response: object;

    @Column({ type: 'varchar', nullable: true })
    responseMessage: string;
}
