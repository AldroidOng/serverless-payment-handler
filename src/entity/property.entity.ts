import { AbstractEntity } from './abstract.entity';
import { Column, DeepPartial, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

import { Listing, POI } from './listing.entity';
import { Location } from './location.entity';

@Entity('properties')
export class Property extends AbstractEntity {
    constructor(input?: DeepPartial<Property>) {
        super(input);
    }

    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: 'json', nullable: true })
    facilities: number[];

    @Column({ type: 'json', nullable: true })
    pois: POI[];

    @Column({ type: 'boolean', default: false })
    hasPublicTransport: boolean;

    @Column({ type: 'json', nullable: true })
    publicTransportOptions: number[];

    @Column({ type: 'json', nullable: true })
    facilityVideos: string[];

    @Column({ type: 'varchar', nullable: true })
    facilityVirtualTour: string;

    @OneToMany(() => Listing, (listing) => listing.propertyId)
    listings?: Listing[];

    @Column({ type: 'varchar', nullable: true })
    locationId?: string;

    @ManyToOne((type) => Location, (location: Location) => location.id)
    @JoinColumn()
    location?: Location;
}
