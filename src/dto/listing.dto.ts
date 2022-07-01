
import { AddressDto } from '../entity/embedded-entity';

import { CaptionedUrl } from './draft-listing.dto';
import { ESignAgreement } from '../entity/e-signature-agreement.entity';
import { PhotographerDto } from './photographer.dto';
import { PropertyDto } from './property.dto';
import { User } from '../entity/user.entity';
import {
    BathroomType,
    FloorLevel,
    Furnishing,
    FurnishType,
    GenderRule,
    HouseRule,
    ListingStatus,
    POIType,
    RoomType,
    TopFeature,
    UnitPropertyType,
    UnitType,
    UtilityIncluded,
    UtilityType,
    Wifi,
} from '../enums/listing.enum';
import { ListingAnalyticDTO } from '../entity/listing-analytic.entity';

export class ListingPerformanceData {
    virtualTourView?: number;
    favouriteCount?: number;
    pageView?: number;
}

export class POIDto {
    name: string;
    type: POIType;
    longitude?: number;
    latitude?: number;
    distance?: number;
    duration?: number;
}

export class ListingDto {
    id: number;
    propertyId?: string;
    ownerId?: string;
    agreementId?: number;
    agreement?: ESignAgreement;
    analytics?: ListingAnalyticDTO;
    property?: PropertyDto;
    tenancyAgreementFee: number;
    stampingFee: number;
    area: string;
    address: AddressDto;
    unitType: UnitType;
    unitPropertyType: UnitPropertyType;
    furnishType: FurnishType;
    bedroom: number;
    bathroom: number;
    carpark: number;
    squareFeet: number;
    utilityDeposit: number;
    isUtilityDepositAbsolute: boolean;
    utilityDepositValue: number;
    electricityBill: UtilityIncluded;
    waterBill: UtilityIncluded;
    furnishing: Furnishing[];
    roomFurnishing: Furnishing[];
    sharedFurnishing: Furnishing[];
    topFeatures: TopFeature[];
    houseRules: HouseRule[];
    photoUrls: string[];
    videoUrls: string[];
    utilities: UtilityType[];
    availableAt: Date;
    price: number;
    currency: string;
    tenancyMonth: number;
    depositMonth: number;
    isDepositAbsolute: boolean;
    depositValue: number;
    status: ListingStatus;
    roomType: RoomType;
    bathroomType: BathroomType;
    genderRule: GenderRule;
    uriFragment: string;
    minRentalAmount?: number;
    isDuplicated?: boolean;
    viewingAssistance: string;
    virtualTour: string;
    floorLevel?: FloorLevel;
    wifi?: Wifi;
    scheduledPhotographyDateTime?: Date;
    scheduledPhotographyDuration?: number;
    notes: string;
    createdAt?: Date;
    updatedAt?: Date;
    pois: POIDto[];
    photographer?: PhotographerDto;
    lastCheckedOn?: Date;
    tags: string[];
    verified: boolean;
    owner?: User;
    captionedPhotoUrls?: CaptionedUrl[];
    captionedVideoUrls?: CaptionedUrl[];
    rePublish?: Date[];
    firstPublish?: Date;
    supplierPhotos: CaptionedUrl[] | null;
    supplierVideoUrl: string | null;
}
