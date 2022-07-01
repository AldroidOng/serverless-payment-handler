import { IAddress } from '../dto/address.dto';

export const toFormattedAddress = (address: IAddress) => {
    const addressParts = [];

    if (address) {
        if (address.buildingName?.length > 0) {
            addressParts.push(address.buildingName);
        }

        if (address.fullUnitNumber?.length > 0) {
            addressParts.push(address.fullUnitNumber);
        }

        if (address.streetLine1?.length > 0) {
            addressParts.push(address.streetLine1);
        }

        if (address.streetLine2?.length > 0) {
            addressParts.push(address.streetLine2);
        }

        if (address.postcode?.length > 0) {
            if (address.subArea) {
                addressParts.push(`${address.postcode} ${address.subArea}`);
            } else {
                addressParts.push(address.postcode);
            }
        }

        if (address.area) {
            addressParts.push(address.area);
        }

        if (address.state?.length > 0) {
            addressParts.push(address.state);
        }

        if (address.countryCode !== process.env.DEFAULT_COUNTRY_CODE) {
            addressParts.push(address.country);
        }
    }

    return addressParts.join(', ');
};

export const parseAddressByLevel = (address: string, level: number) => {
    if (!address) return '';

    const strArray = address
        .replace(/\s*,\s*/g, ',') // Remove spaces
        .split(',')
        .reverse();

    if (!strArray[level - 1]) return '';

    return strArray[level - 1].toLowerCase();
};

export const getStreetAddress = (address: string, subarea: string, area: string, state: string, country: string, postcode: string) => {
    if (!address) return '';

    const strArray = address
        .replace(/\s*,\s*/g, ',') // Remove spaces
        .split(',');

    const filteredArray = strArray.filter((a) => {
        if (a.includes(country)) return false;
        if (a.includes(state)) return false;
        if (a.includes(area)) return false;
        if (a.includes(subarea)) return false;
        if (a.includes(postcode)) return false;

        return true;
    });

    return filteredArray.join();
};
