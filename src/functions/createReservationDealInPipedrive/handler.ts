import "source-map-support/register";

import { Database } from '../../typeorm/database'
import { DataSource, In } from "typeorm";
import { middyfy } from "@libs/lambda";
import axios from 'axios';
import { SQSContentForCreateReservationDeal, SQSContentForEmail } from "src/dto/processPaymentCallback.dto";
import { Listing } from "src/entity/listing.entity";
import { Booking } from "src/entity/booking.entity";
import { PipeDriveDealsField } from "src/enums/pipedrive.enum";
import { parseAmenities, parseFurnishingLevel, parseFurniture, parseNotes, parseUnitType } from "src/utils/pipedrive-mapping";
import { parseAddressByLevel, toFormattedAddress } from "src/utils/formatter";
import { ReferenceType } from "src/enums/reference.enum";
import { LocationLevels } from "src/enums/location.enum";
import { AddressDto } from "src/entity/embedded-entity";
import { ListingAnalyticDTO } from "src/entity/listing-analytic.entity";
import { Facility, Furnishing, HouseRule, POIType, PublicTransportOption, TopFeature } from "src/enums/listing.enum";
import { Property } from "src/entity/property.entity";
import { PropertyDto } from "src/dto/property.dto";
import { ListingDto, POIDto } from "src/dto/listing.dto";
import { Tag } from "src/entity/tag.entity";
import { DraftListingDto } from "src/dto/draft-listing.dto";
import { LocationDto } from "src/dto/location.dto";
import moment from 'moment-timezone';
import { Reference } from "src/entity/reference.entity";
import { removeUrlInvalidChars } from "src/utils/removeUrlInvalidChars";
import { Location } from "src/entity/location.entity";
import { invokeAWSLambdaPublishError } from "src/utils/slackNotifier";
import { LambdaFailLocation } from "src/enums/error.enum";

const createReservationDealInPipedrive = async (event, context) => {
  console.log(event)

  const { title, bookingId, crmUserId }: SQSContentForCreateReservationDeal = JSON.parse(event.Records[0].body)
  await Database.initialize()
    .then(() => {
      console.log("DB connected")
    })
    .catch((error) => {
      console.log("DB error here")
      console.log(error)
    })

  try {
    const bookingRepository = Database.getRepository(Booking)
    const booking = await bookingRepository.findOne({
      where: { id: bookingId },
      relations: [
        'listing',
        'listing.agreement',
        'listing.property',
        'listing.property.location',
        'listing.photographer'
      ],
    })
    const { listing } = booking
    if (!listing) { throw new Error('Listing not found with booking id: ' + bookingId); }
    const parsedListing = await mapParams(listing, Database);
    const listingData = propertyOverride(parsedListing, parsedListing.property, parsedListing.property?.location) as ListingDto;
    const isCreateReservationDealSuccess = await createReservationDeal(title, listingData, crmUserId)
    console.log("Creation of reservation successful: " + isCreateReservationDealSuccess)
    if (!isCreateReservationDealSuccess) {
      throw new Error('Failed to create reservation deal')
    }
  } catch (error) {
    console.log(error)
    const content = JSON.stringify({ body: JSON.parse(event.Records[0].body), error: error.toString(), failAtLambdaLocation: LambdaFailLocation.CREATE_RESERVATION_DEAL_PIPEDRIVE })
    console.log(content)
    await invokeAWSLambdaPublishError(content)
    throw error
  } finally {
    await Database.destroy()
  }
}

export const main = middyfy(createReservationDealInPipedrive);

const createReservationDeal = async (title: string, listing, crmUserId?: string): Promise<boolean> => {
  const options = pipedriveOptions();
  const customFields = buildListingCustomFields(listing);
  return await createDeal(title, options.pipelines.RESERVATION, customFields, crmUserId);
}

const pipedriveOptions = () => {
  return {
    apiKey: process.env.PIPEDRIVE_API_KEY,
    companyDomain: process.env.PIPEDRIVE_COMPANY_DOMAIN,
    organizationId: process.env.PIPEDRIVE_ORG_ID,
    pipelines: {
      LISTING: process.env.PIPEDRIVE_PIPELINES_LISTING,
      VIEWING: process.env.PIPEDRIVE_PIPELINES_VIEWING,
      RESERVATION: process.env.PIPEDRIVE_PIPELINES_RESERVATION,
      INBOX: process.env.PIPEDRIVE_PIPELINES_INBOX,
    },
  };
}

const buildListingCustomFields = (listing: ListingDto): Record<string, any> => {
  return {
    [PipeDriveDealsField.FURNISHING_LEVEL]: parseFurnishingLevel(listing.furnishType.toString()),
    [PipeDriveDealsField.LIST_OF_AMENITIES_AVAILABLE]: parseAmenities(listing.property.facilities.map(String)),
    [PipeDriveDealsField.LIST_OF_FURNITURES_AVAILABLE]: parseFurniture(listing.furnishing.map(String)),
    [PipeDriveDealsField.NUMBER_OF_BATHROOMS]: listing.bathroom,
    [PipeDriveDealsField.NUMBER_OF_BEDROOMS]: listing.bedroom,
    [PipeDriveDealsField.NUMBER_OF_PARKING_LOTS]: String(listing.carpark),
    [PipeDriveDealsField.PHOTOGRAPH_LINK]: listing.photoUrls,
    [PipeDriveDealsField.PROPERTY_ADDRESS]: toFormattedAddress(listing.address),
    [PipeDriveDealsField.PROPERTY_TYPE]: listing.unitPropertyType ? listing.unitPropertyType : listing.property.location.propertyType,
    [PipeDriveDealsField.RENTAL_AVAILABLE_DATE]: moment(listing.availableAt, 'YYYY-MM-DD').toDate().toDateString(),
    [PipeDriveDealsField.MONTHLY_RENT]: listing.price,
    [PipeDriveDealsField.REQUIRED_DEPOSIT_AMOUNT]: roundCurrency(listing.price * listing.depositMonth) + listing.utilityDeposit,
    [PipeDriveDealsField.TENANCY_PERIOD]: listing.tenancyMonth,
    [PipeDriveDealsField.TYPE_OF_UNIT]: parseUnitType(listing.unitType),
    [PipeDriveDealsField.TENANCY_PERIOD]: listing.tenancyMonth,
    [PipeDriveDealsField.REQUESTED_PHOTOGRAPHY_DATE]: listing.scheduledPhotographyDateTime,
    [PipeDriveDealsField.REQUESTED_PHOTOGRAPHY_TIME]: parseTime(listing.scheduledPhotographyDateTime),
    [PipeDriveDealsField.NOTES]: parseNotes(listing),
  };
}

const mapParams = async (listing: Listing, db: DataSource): Promise<ListingDto> => {
  const listingOptions = {
    virtualTourCustomDomain: <string>process.env.LISTING_VIRTUAL_TOUR_CUSTOM_DOMAIN,
    virtualTourCustomDomainEnabled: <string>process.env.LISTING_VIRTUAL_TOUR_CUSTOM_DOMAIN_ENABLED === 'true',
  };

  try {
    if (listingOptions?.virtualTourCustomDomainEnabled && listing.virtualTour) {
      listing.virtualTour = listing.virtualTour
        .replace('www.kuula.co', 'kuula.co')
        .replace('kuula.co', listingOptions.virtualTourCustomDomain);
    }
    const [
      unitPropertyType,
      bedroom,
      bathroom,
      furnishType,
      unitType,
      waterBill,
      electricityBill,
      furnishing,
      roomFurnishing,
      sharedFurnishing,
      topFeatures,
      houseRules,
      roomType,
      bathroomType,
      genderRule,
      floorLevel,
      wifi,
    ] = await Promise.all([
      getStringCodesByReferenceCodes(ReferenceType.UnitPropertyType, [listing.unitPropertyType], db),
      getStringCodesByReferenceCodes(ReferenceType.Bedroom, [listing.bedroomCode], db),
      getStringCodesByReferenceCodes(ReferenceType.Bathroom, [listing.bathroomCode], db),
      getStringCodesByReferenceCodes(ReferenceType.FurnishType, [listing.furnishType], db),
      getStringCodesByReferenceCodes(ReferenceType.UnitType, [listing.unitType], db),
      getStringCodesByReferenceCodes(ReferenceType.UtilityIncluded, [+listing.waterBill], db),
      getStringCodesByReferenceCodes(ReferenceType.UtilityIncluded, [+listing.electricityBill], db),
      getStringCodesByReferenceCodes(ReferenceType.Furnishing, listing.furnishing, db),
      getStringCodesByReferenceCodes(ReferenceType.Furnishing, listing.roomFurnishing, db),
      getStringCodesByReferenceCodes(ReferenceType.Furnishing, listing.sharedFurnishing, db),
      getStringCodesByReferenceCodes(ReferenceType.TopFeature, listing.topFeatures, db),
      getStringCodesByReferenceCodes(ReferenceType.HouseRule, listing.houseRules, db),
      getStringCodesByReferenceCodes(ReferenceType.RoomType, [listing.roomType], db),
      getStringCodesByReferenceCodes(ReferenceType.BathroomType, [listing.bathroomType], db),
      getStringCodesByReferenceCodes(ReferenceType.GenderRule, [listing.genderRule], db),
      getStringCodesByReferenceCodes(ReferenceType.FloorLevel, [listing.floorLevel], db),
      getStringCodesByReferenceCodes(ReferenceType.Wifi, [listing.wifi], db),
    ]);
    listing.bedroomCode = null;
    listing.bathroomCode = null;
    const parsedProperty = listing.property ? await mapPropertyParams(listing.property, db) : null;

    const parsedPropertyPOIs = parsedProperty ? parsedProperty.pois : null;
    const lastCheckedDate = listing.lastCheckedOn ? new Date(listing.lastCheckedOn) : null;
    const isSecurityDepositAbsolute = listing.depositValue > 0;
    const isUtilityDepositAbsolute = listing.utilityDepositValue > 0;
    return Object.assign(listing, {
      address: {
        block: listing.address.block,
        floor: listing.address.floor,
        unitNo: listing.address.unitNo,
        fullUnitNumber: listing.address.fullUnitNumber || listing.address.unitNo,
        buildingName: parsedProperty?.location?.name,
        streetLine1: `${parsedProperty?.location?.streetAddress}, ${parsedProperty?.location?.address}`,
        subArea: parseAddressByLevel(parsedProperty?.location?.address, LocationLevels.SubArea),
        area: parseAddressByLevel(parsedProperty?.location?.address, LocationLevels.Area),
        state: parseAddressByLevel(parsedProperty?.location?.address, LocationLevels.State),
        country: parseAddressByLevel(parsedProperty?.location?.address, LocationLevels.Country),
        countryCode: parsedProperty?.location?.countryCode.toUpperCase(),
        postcode: parsedProperty?.location?.postcode,
      } as AddressDto,
      area: parseAddressByLevel(parsedProperty?.location?.address, LocationLevels.Area),
      bedroom: parseInt(bedroom[0], 10) || 0,
      bathroom: parseInt(bathroom[0], 10) || 0,
      furnishType: furnishType[0],
      analytics:
        listing.analytics &&
        ({
          compositePageView: listing.analytics.compositePageView,
          compositeVirtualTour: listing.analytics.compositeVirtualTour,
          favourites: listing.analytics.favourites,
        } as ListingAnalyticDTO),
      unitType: unitType[0],
      waterBill: waterBill[0],
      utilityDeposit: isUtilityDepositAbsolute ? listing.utilityDepositValue : listing.utilityDeposit,
      depositMonth: isSecurityDepositAbsolute ? listing.depositValue : listing.depositMonth,
      electricityBill: electricityBill[0],
      furnishing: furnishing as Furnishing[],
      roomFurnishing: roomFurnishing as Furnishing[],
      sharedFurnishing: sharedFurnishing as Furnishing[],
      topFeatures: topFeatures as TopFeature[],
      houseRules: houseRules as HouseRule[],
      roomType: roomType[0],
      bathroomType: bathroomType[0],
      genderRule: genderRule[0],
      floorLevel: floorLevel[0],
      wifi: wifi[0],
      unitPropertyType: unitPropertyType[0],
      property: parsedProperty,
      pois: parsedPropertyPOIs,
      lastCheckedOn: lastCheckedDate,
      tags: await mapTagParams(listing.tags, db),
      isUtilityDepositAbsolute,
      utilityDepositValue: isUtilityDepositAbsolute ? listing.utilityDepositValue : listing.utilityDeposit,
      isDepositAbsolute: isSecurityDepositAbsolute,
      depositValue: isSecurityDepositAbsolute ? listing.depositValue : listing.depositMonth,
      supplierPhotos: listing.supplierPhotos
        ? listing.supplierPhotos.map((cu) => {
          const cdnUrl = changeToCdnUrl(cu.url);

          return {
            url: cdnUrl,
            label: cu.label,
          };
        })
        : null,
      supplierVideoUrl: listing.supplierVideoUrl,
    });
  } catch (err) {
    throw err;
  }
}

const getStringCodesByReferenceCodes = async (type: ReferenceType, referenceCodes: number[], db: DataSource): Promise<string[]> => {
  if (!referenceCodes) {
    return [];
  }
  const translationConfig = translationConfigObj();

  const [err, config] = await to(getCountryConfigCached(translationConfig.countryCode, db));
  if (err) {
    throw err;
  }

  const refs = config.getReferences(type);
  if (!refs) {
    return [];
  }

  return [
    ...referenceCodes.reduce((acc, v) => {
      if (!v) {
        return acc;
      }

      if (refs.has(v)) {
        const ref = refs.get(v);
        if (ref.value.hasOwnProperty(translationConfig.langCode)) {
          acc.add(ref?.value[translationConfig.langCode]);
        }
      }

      return acc;
    }, new Set<string>([])),
  ];
}

const mapPropertyParams = async (property: Property, db: DataSource): Promise<PropertyDto> => {
  try {
    if (property) {
      let pois = null;
      if (property.pois) {
        pois = await Promise.all(
          property?.pois?.map(async (p) => {
            let poi = new POIDto();
            poi = Object.assign({}, p, {
              type: (
                await getStringCodesByReferenceCodes(ReferenceType.POIType, [p.type], db)
              )[0] as POIType,
            });
            return poi;
          }),
        );
      }
      const parsedLocation = property.location ? await mapLocationParams(property.location, db) : null;
      return Object.assign(property, {
        facilities: (await getStringCodesByReferenceCodes(
          ReferenceType.Facility,
          property.facilities,
          db,
        )) as Facility[],
        publicTransportOptions: (await getStringCodesByReferenceCodes(
          ReferenceType.PublicTransportOption,
          property.publicTransportOptions,
          db,
        )) as PublicTransportOption[],
        pois,
        location: parsedLocation,
      });
    }
    return new PropertyDto();
  } catch (err) {
    throw err
  }
}

const mapTagParams = async (arrayTags: number[], db) => {
  try {
    if (!arrayTags || arrayTags?.length === 0) {
      return [];
    }
    const tagRepository = Database.getRepository(Tag)

    const tags = await tagRepository.find({ where: { id: In(arrayTags) } });
    if (tags?.length > 0) {
      return tags.map((v) => v.name);
    }
    return [];
  } catch (err) {
    throw err
  }
}

const changeToCdnUrl = (s3Url: string): string => {
  try {
    const parsedUrl = new URL(s3Url);
    if (parsedUrl.protocol === 's3:' || parsedUrl.hostname.endsWith('amazonaws.com')) {
      const path = decodeURIComponent(parsedUrl.pathname);
      const splittedPaths = path.split('/');
      if (!splittedPaths[0]) {
        splittedPaths.shift();
      }
      if (!splittedPaths[splittedPaths.length - 1]) {
        splittedPaths.pop();
      }
      const folderPrefix = splittedPaths
        .slice(0, splittedPaths.length - 1)
        .join('__')
        .replace(/\s/g, '_');
      const keyName = splittedPaths
        .slice(splittedPaths.length - 1)
        .join('__')
        .replace(/\s/g, '_');
      const finalKeyName = [folderPrefix, keyName].filter((p) => p).join('__');

      const assetCdnUrl = process.env.AWS_CDN_ASSET_BUCKET || 'img.xxx.com'

      return `https://${assetCdnUrl}/${removeUrlInvalidChars(finalKeyName)}`;
    }

    return s3Url;
  } catch (e) {
    console.log("changeToCdnUrl function error")
    console.log(e)
    return s3Url;
  }
}

const propertyOverride = (listing: ListingDto | DraftListingDto, property: PropertyDto, location: LocationDto): ListingDto | DraftListingDto => {
  if (!listing.propertyId || !property || !location) {
    return listing;
  }

  const { id, pois, hasPublicTransport, publicTransportOptions, createdAt, updatedAt, deletedAt, facilities, ...rest } = property;
  const { name, streetAddress, address, country, countryCode, postcode, longitude, latitude } = location;

  listing = Object.assign(listing, rest);
  listing.address = Object.assign(listing.address, {
    buildingName: name,
    streetLine1: `${streetAddress ? streetAddress : ''}`,
    postcode,
    subArea: parseAddressByLevel(address, LocationLevels.SubArea),
    area: parseAddressByLevel(address, LocationLevels.Area),
    state: parseAddressByLevel(address, LocationLevels.State),
    country,
    countryCode,
  });
  listing.area = listing.address.area;
  listing.pois = pois;

  listing.propertyId = `${id}`;
  return listing;
}

const createDeal = async (title: string, pipelineId: string, customFields: Record<string, string>, crmUserId?: string): Promise<boolean> => {
  const options = pipedriveOptions();
  try {
    const body = {
      title,
      pipeline_id: pipelineId,
      ...customFields,
      ...(crmUserId && { person_id: +crmUserId }),
    };
    const resp = await axios.post(`https://${options.companyDomain}.pipedrive.com/api/v1/deals?api_token=${options.apiKey}`, body);
    console.log("axios resp")
    console.log(resp)
    return true;
  } catch (err) {
    throw (err)
  }
}

export function roundCurrency(num: number): number {
  return Math.round((num + Number.EPSILON) * 100) / 100;
}

export const parseTime = (date) => {
  return moment(date).tz('Asia/Kuala_Lumpur').format('HH:mm');
};

/**
 * @param { Promise } promise
 * @param { Object= } errorExt - Additional Information you can pass to the err object
 * @return { Promise }
 */
export function to<T, U = Error>(promise: Promise<T>, errorExt?: object): Promise<[U | null, T | undefined]> {
  return promise
    .then<[null, T]>((data: T) => [null, data])
    .catch<[U, undefined]>((err: U) => {
      if (errorExt) {
        Object.assign(err, errorExt);
      }

      return [err, undefined];
    });
}

const getCountryConfigCached = async (countryCode: string, db: DataSource): Promise<ReferenceCollection | null> => {
  const referenceRepository = db.getRepository(Reference)
  const [err, references] = await to(
    referenceRepository.find({
      where: {
        country: countryCode,
      },
    }),
  );

  if (!references) {
    return null;
  }

  const config = new ReferenceCollection(references);
  return config;
}


export class ReferenceCollection {
  private collection: Map<number, Map<number, Reference>>;

  constructor(references: Reference[]) {
    this.collection = references.reduce((r, v) => {
      if (!r.has(v.type)) {
        r.set(v.type, new Map<number, Reference>());
      }

      r.set(v.type, r.get(v.type).set(v.code, v));

      return r;
    }, new Map<number, Map<number, Reference>>());
  }

  getReferences(type: ReferenceType): Map<number, Reference> | undefined {
    return this.collection.get(type);
  }

  getReference(type: ReferenceType, code: number): Reference | undefined {
    return this.collection.get(type)?.get(code);
  }
}


const mapLocationParams = async (location: Location, db: DataSource): Promise<LocationDto> => {
  try {

    const translationConfig = translationConfigObj()


    const [level, propertyGroupType, propertyType] = await Promise.all([
      getStringCodesByReferenceCodes(ReferenceType.LocationLevel, [location.level], db),
      getStringCodesByReferenceCodes(ReferenceType.PropertyGroupType, [location.propertyGroupType], db),
      getStringCodesByReferenceCodes(ReferenceType.LocationPropertyType, [location.propertyType], db),
    ]);

    const parsedProperty = location.properties ? await mapPropertyParams(location.properties[0], db) : null;
    const address = location.address[translationConfig.langCode];

    return Object.assign(location, {
      name: location.name[translationConfig.langCode],
      description: location.description ? location.description[translationConfig.langCode] : '',
      streetAddress: location.streetAddress ? location.streetAddress[translationConfig.langCode] : null,
      address,
      state: parseAddressByLevel(address, LocationLevels.State),
      level: level[0],
      photoUrls: location.photoUrls ? (location.photoUrls as string[]) : [],
      propertyGroupType: propertyGroupType ? propertyGroupType[0] : null,
      propertyType: propertyType ? propertyType[0] : null,
      propertyId: location.properties && location.properties.length > 0 ? location.properties[0].id : null,
      ...(parsedProperty && { hasPublicTransport: parsedProperty?.hasPublicTransport ? parsedProperty.hasPublicTransport : null }),
      ...(parsedProperty && { facilities: parsedProperty?.facilities ? parsedProperty.facilities : null }),
      ...(parsedProperty && {
        publicTransportOptions: parsedProperty?.publicTransportOptions ? parsedProperty.publicTransportOptions : null,
      }),
      ...(parsedProperty && { pois: parsedProperty?.pois ? parsedProperty.pois : null }),
      ...(parsedProperty && { propertyId: parsedProperty?.id ? parsedProperty.id : null }),
      ...(parsedProperty && { facilityVideos: parsedProperty?.facilityVideos ? parsedProperty.facilityVideos : null }),
      ...(parsedProperty && { facilityVirtualTour: parsedProperty?.facilityVirtualTour ? parsedProperty.facilityVirtualTour : null }),
    });
  } catch (err) {
    console.log(err);
    throw err;
  }
}

const translationConfigObj = () => {
  return {
    countryCode: process.env.TRANSLATIONS_DEFAULT_COUNTRY_CODE || 'my',
    langCode: process.env.TRANSLATIONS_DEFAULT_LANG_CODE || 'en',
  }
};