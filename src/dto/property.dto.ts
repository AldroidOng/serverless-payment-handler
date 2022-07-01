import { POIDto } from './listing.dto';
import { Listing } from '../entity/listing.entity';
import { Facility, PublicTransportOption } from '../enums/listing.enum';
import { LocationDto } from './location.dto';

export class PropertyDto {
    id: number;
    facilities?: Facility[];
    pois?: POIDto[];
    hasPublicTransport: boolean;
    facilityVideos?: string[];
    facilityVirtualTour?: string;
    publicTransportOptions?: PublicTransportOption[];
    listings?: Listing[];
    locationId?: string;
    location?: LocationDto;
    readonly createdAt?: Date;
    readonly updatedAt?: Date;
    readonly deletedAt?: Date;
}
