import { Column, DeepPartial, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

import { Listing } from './listing.entity';
import { PromotionCode } from './promotion-code.entity';
import { AbstractEntity } from './abstract.entity';
import { User } from './user.entity';
import { BookingCollectionType, BookingOtherRelationship, BookingRelationship, BookingStatus } from '../enums/booking.enum';
import { Leasing } from './leasing.entity';

@Entity('bookings')
export class Booking extends AbstractEntity {
    constructor(input?: DeepPartial<Booking>) {
        super(input);
    }

    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: 'smallint', nullable: true })
    listingId?: number;

    @OneToMany((type) => Leasing, (leasing) => leasing.booking)
    @JoinColumn({ name: 'booking_id', referencedColumnName: 'booking' })
    leasing: Leasing;

    @ManyToOne((type) => Listing, (listing) => listing.id)
    listing: Listing;

    @ManyToOne((type) => User, (user) => user.id)
    user: User;

    @ManyToOne((type) => PromotionCode, (promotionCode) => promotionCode.code)
    @JoinColumn({ name: 'promotion_code', referencedColumnName: 'code' })
    promotionCode: PromotionCode;

    @Column({ type: 'varchar', length: 255, nullable: true })
    fullName?: string;

    @Column({ type: 'date', nullable: false })
    movedInDate: string;

    @Column({ type: 'datetime', nullable: false })
    movedInStartDate: Date;

    @Column({ type: 'datetime', nullable: false })
    movedInEndDate: Date;

    @Column({ type: 'date', nullable: false })
    contractEnd: string;

    @Column({ type: 'varchar', length: 50, nullable: false })
    occupation: string;

    @Column({ type: 'varchar', length: 50, nullable: true })
    identificationNumber: string;

    @Column({ type: 'varchar', length: 255, nullable: true })
    companyInstitution: string;

    @Column({ type: 'varchar', length: 255, nullable: true })
    landlordName: string;

    @Column({ type: 'varchar', length: 45, nullable: true })
    landlordIC: string;

    @Column({ type: 'varchar', length: 255, nullable: true })
    landlordEmail: string;

    @Column({ type: 'varchar', length: 15, nullable: true })
    landlordMobile: string;

    @Column({ type: 'varchar', length: 45, nullable: false })
    relationship: BookingRelationship;

    @Column({ type: 'varchar', length: 45, nullable: false })
    otherRelationship: BookingOtherRelationship;

    @Column({ type: 'smallint', nullable: false })
    noOfResidents: number;

    @Column({ type: 'varchar', length: 2, nullable: false })
    nationality: string;

    @Column({ type: 'bool', nullable: false, default: true })
    tenantAgreed: boolean;

    @Column({ type: 'bool', nullable: true, default: false })
    tenantSigned: boolean;

    @Column({ type: 'bool', nullable: true, default: false })
    tenantPaid: boolean;

    @Column({ type: 'bool', nullable: true, default: false })
    depositPaid: boolean;

    @Column({ type: 'bool', nullable: true, default: false })
    landlordSigned: boolean;

    @Column({ type: 'enum', enum: BookingStatus, nullable: false })
    status: BookingStatus;

    @Column({ type: 'varchar', length: 2000, nullable: true })
    contractLink: string;

    @Column({ type: 'text', nullable: true })
    notes: string;

    @Column({ type: 'varchar', length: 50, nullable: true })
    ctosEntity: string;

    @Column({ type: 'varchar', length: 25, nullable: true })
    emergencyMobile: string;

    @Column({ type: 'varchar', length: 25, nullable: true })
    emergencyRelationship: string;

    @Column({ type: 'boolean', default: false })
    moveInEmailSent: boolean;

    @Column({ type: 'float', nullable: true, default: 0 })
    price: number;

    @Column({ type: 'float', default: 0 })
    miscellaneousDeposit: number;

    @Column({ type: 'float', default: 0 })
    rentalDeposit: number;

    @Column({ type: 'float', default: 0 })
    rentalDepositDiscount: number;

    @Column({ type: 'float', default: 0 })
    utilityDeposit: number;

    @Column({ type: 'float', default: 0 })
    utilityDepositDiscount: number;

    @Column({ type: 'float', default: 0 })
    advanceRental: number;

    @Column({ type: 'float', default: 0 })
    advanceRentalDiscount: number;

    @Column({ type: 'float', default: 0 })
    tenancyAgreementFee: number;

    @Column({ type: 'float', default: 0 })
    stampingFee: number;

    @Column({ type: 'boolean', default: false })
    moveInScheduled: boolean;

    @Column({ type: 'varchar', length: 120, nullable: true })
    emergencyContactName: string;

    isDirectDebitEnabled?: boolean;

    @Column({ type: 'bool', name: 'personal_data_access_agreement' })
    personalDataAccessAgreement: boolean;

    @Column({ type: 'bool', name: 'refund_agreement' })
    refundAgreement: boolean;

    @Column({ type: 'float', default: 1 })
    paymentDueDateDay: number;

    @Column({ type: 'enum', enum: BookingCollectionType })
    collectionType: BookingCollectionType;

    @Column({ type: 'boolean', default: true })
    collectionStatus: boolean;

    @Column({ type: 'float' })
    sstValue: number;

    @Column({ type: 'float' })
    sstPercent: number;
}
