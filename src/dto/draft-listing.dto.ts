import { AddressDto } from '../entity/embedded-entity';

import { ESignAgreement } from '../entity/e-signature-agreement.entity';
import { ListingDto, POIDto } from '../dto/listing.dto';
import {
    BathroomType,
    FloorLevel,
    Furnishing,
    FurnishType,
    GenderRule,
    HouseRule,
    RoomType,
    TopFeature,
    UnitPropertyType,
    UnitType,
    UtilityIncluded,
    UtilityType,
    Wifi,
} from '../enums/listing.enum';
import { PhotographerDto } from '../dto/photographer.dto';
import { PropertyDto } from '../dto/property.dto';
import { User } from '../entity/user.entity';
import { DraftListingStatus, MediaIndicatorFlags } from '../enums/draft-listing.enum';

export class CaptionedUrl {
    url?: string;
    label?: string;
}

export class DraftListingDto {
    id: number;
    propertyId?: string;
    listingId?: number;
    ownerId?: string;
    agreementId?: number;
    agreement?: ESignAgreement;
    property?: PropertyDto;
    listing?: ListingDto;
    tenancyAgreementFee?: number;
    stampingFee?: number;
    area?: string;
    address: AddressDto;
    unitType?: UnitType;
    unitPropertyType?: UnitPropertyType;
    furnishType?: FurnishType;
    bedroom?: number;
    bathroom?: number;
    carpark?: number;
    squareFeet?: number;
    utilityDeposit?: number;
    isUtilityDepositAbsolute?: boolean;
    utilityDepositValue?: number;
    electricityBill?: UtilityIncluded;
    waterBill?: UtilityIncluded;
    furnishing?: Furnishing[];
    roomFurnishing?: Furnishing[];
    sharedFurnishing?: Furnishing[];
    topFeatures?: TopFeature[];
    assets?: string[]; //eg no. of key cards, and no. of keys
    houseRules?: HouseRule[];
    photoUrls?: CaptionedUrl[];
    videoUrls?: CaptionedUrl[];
    rawVirtualTourUrls?: CaptionedUrl[];
    rawVideosUrls?: CaptionedUrl[];
    adminProcessorId?: string;
    adminPhotographerId?: string;
    utilities?: UtilityType[];
    availableAt?: Date;
    price?: number;
    currency?: string;
    tenancyMonth?: number;
    depositMonth?: number;
    isDepositAbsolute?: boolean;
    depositValue?: number;
    status?: DraftListingStatus;
    roomType?: RoomType;
    bathroomType?: BathroomType;
    genderRule?: GenderRule;
    uriFragment?: string;
    minRentalAmount?: number;
    isDuplicated?: boolean;
    viewingAssistance?: string;
    virtualTour?: string;
    virtualTourEditUrl: string;
    floorLevel?: FloorLevel;
    wifi?: Wifi;
    scheduledPhotographyDateTime?: Date;
    scheduledPhotographyDuration?: number;
    notes?: string;
    createdAt?: Date;
    updatedAt?: Date;
    pois?: POIDto[];
    photographer?: PhotographerDto;
    lastCheckedOn?: Date;
    tags?: string[];
    verified?: boolean;
    owner?: User;
    supplierNote?: string;
    processorNote?: string;
    photographerNote?: string;
    supplierPhotos?: CaptionedUrl[];
    supplierVideos?: CaptionedUrl[];
    supplierVideoUrl?: string;
    photoIndicator?: MediaIndicatorFlags;
    videoIndicator?: MediaIndicatorFlags;
    virtualTourIndicator?: MediaIndicatorFlags;
    canPublish?: boolean;
    firstPublish?: Date;
    rePublish?: Date[];
    imageHash?: string;

    static toListingDTO(dto: DraftListingDto): ListingDto {
        return {
            address: dto.address,
            area: dto.area,
            availableAt: dto.availableAt,
            bathroom: dto.bathroom,
            bathroomType: dto.bathroomType,
            bedroom: dto.bedroom,
            carpark: dto.carpark,
            currency: dto.currency,
            depositMonth: dto.depositMonth,
            depositValue: dto.depositValue,
            electricityBill: dto.electricityBill,
            furnishType: dto.furnishType,
            furnishing: dto.furnishing,
            genderRule: dto.genderRule,
            houseRules: dto.houseRules,
            id: dto.listingId,
            isDepositAbsolute: dto.isDepositAbsolute,
            isUtilityDepositAbsolute: dto.isUtilityDepositAbsolute,
            notes: dto.notes,
            photoUrls: dto.photoUrls?.map((url) => url.url),
            pois: dto.pois,
            price: dto.price,
            roomFurnishing: dto.roomFurnishing,
            roomType: dto.roomType,
            sharedFurnishing: dto.sharedFurnishing,
            squareFeet: dto.squareFeet,
            stampingFee: dto.stampingFee,
            status: dto.listing?.status,
            tags: dto.tags,
            tenancyAgreementFee: dto.tenancyAgreementFee,
            tenancyMonth: dto.tenancyMonth,
            topFeatures: dto.topFeatures,
            unitPropertyType: dto.unitPropertyType,
            unitType: dto.unitType,
            uriFragment: dto.uriFragment,
            utilities: dto.utilities,
            utilityDeposit: dto.utilityDeposit,
            utilityDepositValue: dto.utilityDepositValue,
            verified: dto.verified,
            videoUrls: dto.videoUrls?.map((url) => url.url),
            viewingAssistance: dto.viewingAssistance,
            virtualTour: dto.virtualTour,
            waterBill: dto.waterBill,
            floorLevel: dto.floorLevel,
            wifi: dto.wifi,
            agreementId: dto.agreementId,
            ownerId: dto.ownerId,
            isDuplicated: dto.isDuplicated,
            minRentalAmount: dto.minRentalAmount,
            propertyId: dto.propertyId,
            captionedVideoUrls: dto.videoUrls,
            captionedPhotoUrls: dto.photoUrls,
            supplierPhotos: dto.supplierPhotos,
            supplierVideoUrl: dto.supplierVideoUrl,
        };
    }
}
