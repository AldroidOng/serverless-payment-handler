import { AbstractEntity } from '../entity/abstract.entity';
import { DeepPartial } from 'typeorm';

import { POIDto } from './listing.dto';
import { Facility, PublicTransportOption } from '../enums/listing.enum';
import { Property } from '../entity/property.entity';
import { LocationPropertyType, PropertyGroupType } from '../enums/location.enum';

export class LocationDto extends AbstractEntity {
    constructor(input?: DeepPartial<LocationDto>) {
        super(input);
    }

    id: number;
    parentId?: number;
    level: string;
    name: string;
    slug: string;
    description?: string;
    propertyType?: LocationPropertyType;
    propertyGroupType?: PropertyGroupType;
    streetAddress?: string;
    address: string;
    postcode?: string;
    state?: string;
    country: string;
    countryCode: string;
    longitude?: number;
    latitude?: number;
    photoUrls?: string[];
    listingCount?: number;
    facilities?: Facility[];
    pois?: POIDto[];
    hasPublicTransport?: boolean;
    publicTransportOptions?: PublicTransportOption[];
    propertyId?: number;
    properties?: Property[];
    facilityVideos?: string[];
    facilityVirtualTour?: string;
}

export class ParentDto {
    id: number;
    parentId: number;
    level: number;
    name: string;
    slug: string;
    country: string;
    countryCode: string;
}
