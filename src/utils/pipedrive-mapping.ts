import * as moment from 'moment-timezone';
import { Facility, Furnishing, HouseRule, UnitType } from 'src/enums/listing.enum';

// parseAmenities, parseFurnishingLevel, parseFurniture, parseNotes, parseTime, parseUnitType

export const parseFurnishingLevel = (furnishing: string) => {
    let result = 'None';
    switch (furnishing) {
        case 'Fully':
            result = 'Fully Furnished';
            break;
        case 'Partly':
            result = 'Partially Furnished';
            break;
    }
    return result;
};

export const parseUnitType = (unit: string) => {
    let result = 'none';
    switch (unit) {
        case UnitType.EntireUnit:
            result = 'Entire Unit';
            break;
        case UnitType.Room:
            result = 'Single Room';
            break;
    }
    return result;
};

export const parseFurniture = (furniture: string[]) => {
    const result = [];
    if (furniture) {
        furniture.forEach((f) => {
            switch (f) {
                case Furnishing.Fans:
                    result.push('Fans');
                    break;
                case Furnishing.Table:
                    result.push('Table');
                    break;
                case Furnishing.Chairs:
                    result.push('Chairs');
                    break;
                case Furnishing.Sofa:
                    result.push('Sofas');
                    break;
                case Furnishing.AirConditioner:
                    result.push('Airconditioners');
                    break;
                case Furnishing.Oven:
                case Furnishing.Microwave:
                    result.push('Microwave/Oven');
                    break;
                case Furnishing.Refrigerator:
                    result.push('Refrigerator');
                    break;
                case Furnishing.WaterHeater:
                    result.push('Water Heater');
                    break;
                case Furnishing.KitchenCabinet:
                    result.push('Kitchen Cabinet');
                    break;
                case Furnishing.Mattress:
                    result.push('Mattress');
                    break;
                case Furnishing.WashingMachine:
                    result.push('Washing Machine');
                    break;
                case Furnishing.BedFrame:
                    result.push('Bed Frame');
                    break;
                case Furnishing.Curtain:
                    result.push('Curtain');
                    break;
                case Furnishing.Wardrobe:
                    result.push('Wardrobe');
                    break;
                case Furnishing.Bathtub:
                    result.push('Bathtub');
                    break;
                case Furnishing.Fridge:
                    result.push('Fridge');
                    break;
                case Furnishing.FireExtinguisher:
                    result.push('Fire Extinguisher');
                    break;
                case Furnishing.SmokeDetector:
                    result.push('Smoke Detector');
                    break;
                case Furnishing.Television:
                    result.push('Television');
                    break;
                case Furnishing.Bookshelf:
                    result.push('Bookshelf');
                    break;
                case Furnishing.Balcony:
                    result.push('Balcony');
                    break;
                case Furnishing.GasStove:
                    result.push('Gas Stove');
                    break;
                case Furnishing.ElectricStove:
                    result.push('Electric Stove');
                    break;
                case Furnishing.InductionStove:
                    result.push('Induction Stove');
                    break;
                case Furnishing.WaterFilter:
                    result.push('Water Filter');
                    break;
                case Furnishing.Dryer:
                    result.push('Dryer');
                    break;
                case Furnishing.DiningTable:
                    result.push('Dining Table');
                    break;
                case Furnishing.DishWasher:
                    result.push('Dish Washer');
                    break;
                case Furnishing.Shower:
                    result.push('Shower');
                    break;
                case Furnishing.Bed:
                    result.push('Bed');
                    break;
            }
        });
    }
    return result.join(', ');
};

export const parseAmenities = (amenities: string[]) => {
    const result = [];
    if (amenities) {
        amenities.forEach((f) => {
            switch (f) {
                case Facility.ConvenienceStore:
                    result.push('Convenience Store');
                    break;
                case Facility.BBQ:
                    result.push('BBQ Pit');
                    break;
                case Facility.Security:
                    result.push('Security Guards');
                    break;
                case Facility.ATM:
                    result.push('Atm');
                    break;
                case Facility.Pool:
                    result.push('Swimming Pool');
                    break;
                case Facility.Elevator:
                    result.push('Elevator');
                    break;
                case Facility.Nursery:
                    result.push('Nursery');
                    break;
                case Facility.Sauna:
                    result.push('Sauna');
                    break;
                case Facility.Playground:
                    result.push('Playground');
                    break;
                case Facility.GYM:
                    result.push('Gym Room');
                    break;
                case Facility.Dobby:
                    result.push('Dobby');
                    break;
                case Facility.PublicBallroom:
                    result.push('Public Ballroom');
                    break;
                case Facility.PublicEventSpace:
                    result.push('Public Event Space');
                    break;
                case Facility.Salon:
                    result.push('Salon');
                    break;
                case Facility.Parking:
                    result.push('Parking');
                    break;
                case Facility.Cafe:
                    result.push('Cafe');
                    break;
                case Facility.ShuttleBus:
                    result.push('Shuttle Bus');
                    break;
                case Facility.Concierge:
                    result.push('Concierge');
                    break;
                case Facility.VisitorParking:
                    result.push('Visitor Parking');
                    break;
                case Facility.BadmintonCourt:
                    result.push('Badminton Court');
                    break;
                case Facility.Tennis:
                    result.push('Tennis');
                    break;
                case Facility.LaundryRoom:
                    result.push('Laundry Room');
                    break;
                case Facility.Restaurant:
                    result.push('Restaurant');
                    break;
                case Facility.JoggingTrack:
                    result.push('Jogging Track');
                    break;
            }
        });
    }
    return result.join();
};

export const parseNotes = (listing) => {
    const { id, depositMonth, utilityDeposit, electricityBill, waterBill, houseRules, floorLevel, wifi, notes } = listing;
    return `Listing ID: ${id}
            \n Floor Area: ${floorLevel}
            \n Security Deposit: ${depositMonth} Month
            \n Utility Deposit: ${utilityDeposit} Month
            \n Electric: ${electricityBill?.toString()}
            \n Wifi: ${wifi?.toString()}
            \n Water: ${waterBill?.toString()}
            \n Pets: ${houseRules?.includes(HouseRule.Pets) ? 'Yes' : 'No'}
            \n Smoking: ${houseRules?.includes(HouseRule.Smoking) ? 'Yes' : 'No'}
            \n Cooking: ${houseRules?.includes(HouseRule.Cooking) ? 'Yes' : 'No'}
            \n Notes: ${notes}`;
};