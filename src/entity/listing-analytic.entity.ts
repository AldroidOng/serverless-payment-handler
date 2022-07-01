import { AbstractEntity } from './abstract.entity';
import { Column, DeepPartial, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn } from 'typeorm';

import { Listing } from './listing.entity';

@Entity('listing_analytics')
export class ListingAnalytic extends AbstractEntity {
    constructor(input?: DeepPartial<ListingAnalytic>) {
        super(input);
    }

    @PrimaryGeneratedColumn('increment')
    id: number;

    @Column({ type: 'bigint', nullable: false })
    listingId: number;

    @OneToOne(() => Listing, (l) => l.analytics)
    @JoinColumn({ name: 'listing_id' })
    listing: Listing;

    @Column({ type: 'bigint', nullable: false })
    pageView: number;

    @Column({ type: 'bigint', nullable: false })
    compositePageView: number;

    @Column({ type: 'bigint', nullable: false })
    virtualTour: number;

    @Column({ type: 'bigint', nullable: false })
    compositeVirtualTour: number;

    @Column({ type: 'bigint', nullable: false })
    favourites: number;
}

export class ListingAnalyticDTO {
    compositePageView: number;
    compositeVirtualTour: number;
    favourites: number;
}
