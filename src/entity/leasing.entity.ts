import { Column, DeepPartial, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

import { Booking } from './booking.entity';
import { Listing } from './listing.entity';
import { AbstractEntity } from './abstract.entity';
import { User } from './user.entity';
import { LeasingStatus } from '../enums/leasing.enum';
import { Address } from './embedded-entity';

@Entity('leasings')
export class Leasing extends AbstractEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne((type) => Listing, (listing) => listing.id)
    listing: Listing;

    @ManyToOne((type) => User, (user) => user.id)
    user: User;

    @ManyToOne((type) => Booking, (booking) => booking.id)
    booking: Booking;

    @Column({ type: 'date', nullable: false })
    movedInDate: string;

    @Column({ type: 'date', nullable: false })
    contractEnd: string;

    @Column((type) => Address)
    address: Address;

    @Column({ type: 'float', nullable: true })
    price: number;

    @Column({ type: 'double', nullable: true })
    utilityDeposit: number;

    @Column({ type: 'smallint', nullable: true })
    depositMonth: number;

    @Column({ type: 'enum', enum: LeasingStatus, nullable: false })
    status: LeasingStatus;

    @Column({ type: 'varchar', length: 2000, nullable: true })
    contractLink: string;

    @Column({ type: 'text', nullable: true })
    stampedTenancyAgreementUrl?: string;
}