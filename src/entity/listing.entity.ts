import { AbstractEmbeddedEntity, AbstractEntity } from './abstract.entity';
import { Column, DeepPartial, Entity, ManyToOne, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Property } from './property.entity';
import { User } from './user.entity';
import { ListingStatus, UtilityType } from '../enums/listing.enum';
import { Address } from './embedded-entity';
import { ListingAnalytic } from './listing-analytic.entity';
import { CaptionedUrl } from 'src/dto/draft-listing.dto';
import { ESignAgreement } from './e-signature-agreement.entity';
import { Photographer } from './photographer.entity';

export class POI extends AbstractEmbeddedEntity {
    @Column({ type: 'varchar' })
    name: string;

    @Column({ type: 'bigint' })
    type: number;

    @Column({ type: 'double', nullable: true })
    longitude?: number;

    @Column({ type: 'double', nullable: true })
    latitude?: number;

    @Column({ type: 'double' })
    distance: number;

    @Column({ type: 'double', nullable: true })
    duration?: number;
}
@Entity('listings')
export class Listing extends AbstractEntity {
    constructor(input?: DeepPartial<Listing>) {
        super(input);
    }

    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: 'varchar', nullable: true })
    propertyId?: string;

    @Column({ type: 'varchar', nullable: true })
    ownerId?: string;

    @ManyToOne((type) => User, (user) => user.id)
    owner?: User;

    @OneToOne(() => ListingAnalytic, (la) => la.listing)
    analytics?: ListingAnalytic;

    @Column({ type: 'smallint', nullable: true })
    agreementId?: number;

    @ManyToOne((type) => ESignAgreement, (agreement) => agreement.id)
    agreement?: ESignAgreement;

    @ManyToOne((type) => Property, (property: Property) => property.id)
    property?: Property;

    @Column((type) => Address)
    address: Address;

    @Column({ type: 'float', nullable: true })
    minRentalAmount?: number;

    @Column({ type: 'boolean', nullable: true })
    isDuplicated?: boolean;

    @Column({ type: 'bigint', nullable: true })
    unitType: number;

    @Column({ type: 'bigint', nullable: true })
    unitPropertyType: number;

    @Column({ type: 'bigint', nullable: true })
    furnishType: number;

    @Column({ type: 'bigint', nullable: true })
    bedroomCode: number;

    @Column({ type: 'bigint', nullable: true })
    bathroomCode: number;

    @Column({ type: 'smallint', nullable: true })
    carpark: number;

    @Column({ type: 'smallint', nullable: true })
    squareFeet: number;

    @Column({ type: 'double', nullable: true })
    utilityDeposit: number;

    @Column({ type: 'float', nullable: true })
    utilityDepositValue: number;

    @Column({ type: 'float', nullable: true })
    depositValue: number;

    @Column({ type: 'bigint', nullable: true })
    electricityBill: number;

    @Column({ type: 'bigint', nullable: true })
    waterBill: number;

    @Column({ type: 'json', nullable: true })
    furnishing: number[];

    @Column({ type: 'json', nullable: true })
    roomFurnishing: number[];

    @Column({ type: 'json', nullable: true })
    sharedFurnishing: number[];

    @Column({ type: 'json', nullable: true })
    topFeatures: number[];

    @Column({ type: 'json', nullable: true })
    houseRules: number[];

    @Column({ type: 'json', nullable: true })
    photoUrls: string[];

    @Column({ type: 'json', nullable: true })
    videoUrls: string[];

    @Column({ type: 'json', nullable: true })
    utilities: UtilityType[];

    @Column({ type: 'date', nullable: true })
    availableAt: Date;

    @Column({ type: 'float', nullable: true })
    price: number;

    @Column({ type: 'float', nullable: true, default: 0 })
    tenancyAgreementFee: number;

    @Column({ type: 'float', nullable: true, default: 0 })
    stampingFee: number;

    @Column({ type: 'varchar', length: 10, nullable: true })
    currency: string;

    @Column({ type: 'smallint', nullable: true })
    tenancyMonth: number;

    @Column({ type: 'smallint', nullable: true })
    depositMonth: number;

    @Column({ type: 'varchar', length: 45, default: ListingStatus.Pending })
    status: ListingStatus;

    @Column({ type: 'bigint', nullable: true })
    roomType: number;

    @Column({ type: 'bigint', nullable: true })
    bathroomType: number;

    @Column({ type: 'bigint', nullable: true })
    genderRule: number;

    @Column({ type: 'varchar', length: 64, nullable: true })
    uriFragment: string;

    @Column({ type: 'varchar', length: 32, nullable: true })
    viewingAssistance: string;

    @Column({ type: 'varchar', length: 255, nullable: true })
    virtualTour: string;

    @Column({ type: 'bigint', nullable: true })
    floorLevel?: number;

    @Column({ type: 'bigint', nullable: true })
    wifi?: number;

    @Column({ type: 'datetime', nullable: true })
    scheduledPhotographyDateTime?: Date;

    @Column({ type: 'smallint', nullable: true })
    scheduledPhotographyDuration?: number;

    @Column({ type: 'text', nullable: true })
    notes: string;

    @ManyToOne((type) => Photographer, (photographer) => photographer.id)
    photographer?: Photographer;

    @Column({ type: 'date', nullable: true })
    lastCheckedOn?: Date;

    @Column({ type: 'json', nullable: true })
    tags: number[];

    @Column({ type: 'boolean', default: false, nullable: false })
    verified: boolean;

    @Column({ type: 'json', nullable: true })
    rePublish?: Date[];

    @Column({ type: 'json', nullable: true })
    photographerCompressedPhotos: string[];

    @Column({ type: 'json', nullable: true })
    supplierCompressedPhotos: string[];

    @Column({ type: 'json', nullable: true })
    supplierPhotos: CaptionedUrl[] | null;

    @Column({ type: 'varchar', nullable: true })
    supplierVideoUrl: string | null;

    @Column({ type: 'timestamp', nullable: true })
    firstPublish?: Date;
}
