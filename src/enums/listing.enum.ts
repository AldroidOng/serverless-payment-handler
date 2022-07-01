export enum UnitPropertyType {
    Studio = 'studio',
    Duplex = 'duplex',
}

export enum UnitType {
    EntireUnit = 'entire_unit',
    Room = 'room',
}

export enum PropertyType {
    Landed = 'landed',
    Highrise = 'highrise',
    Room = 'room',
    Condominium = 'condominium',
    Apartment = 'apartment',
}

export enum FloorLevel {
    LowFloor = 'low_floor',
    MediumFloor = 'medium_floor',
    HighFloor = 'high_floor',
}

export enum Wifi {
    NotAvailable = 'not_available',
    InclusiveOnRent = 'inclusive_on_rent',
    NotInclusiveOnRent = 'not_inclusive_on_rent',
}

export enum FurnishType {
    None = 'none',
    Partly = 'partly',
    Fully = 'fully',
}

export enum ListingStatus {
    Pending = 'pending',
    Live = 'live',
    Reserved = 'reserved',
    Occupied = 'occupied',
    Expired = 'expired',
    Invalid = 'invalid',
    ExpiredBp = 'expired-bp',
    ExpiredAp = 'expired-ap',
}

export enum PublicTransportOption {
    None = 'none',
    LRT = 'lrt',
    MRT = 'mrt',
    Monorail = 'monorail',
}

export enum Furnishing {
    Fans = 'fans',
    Table = 'table',
    Chairs = 'chairs',
    Sofa = 'sofa',
    AirConditioner = 'air_conditioner',
    Oven = 'oven',
    Microwave = 'microwave',
    Refrigerator = 'refridgerator',
    WaterHeater = 'water_heater',
    KitchenCabinet = 'kitchen_cabinet',
    Mattress = 'mattress',
    WashingMachine = 'washing_machine',
    BedFrame = 'bed_frame',
    Curtain = 'curtain',
    Wardrobe = 'wardrobe',
    Bathtub = 'bathtub',
    Fridge = 'fridge',
    FireExtinguisher = 'fire_extinguisher',
    SmokeDetector = 'smoke_detector',
    Television = 'television',
    Bookshelf = 'bookshelf',
    Balcony = 'balcony',
    GasStove = 'gas_stove',
    ElectricStove = 'electric_stove',
    InductionStove = 'induction_stove',
    WaterFilter = 'water_filter',
    Dryer = 'dryer',
    DiningTable = 'dining_table',
    DishWasher = 'dishwasher',
    Shower = 'shower',
    Bed = 'bed',
    Desk = 'desk',
}

export enum Facility {
    BBQ = 'bbq',
    ATM = 'atm',
    Pool = 'pool',
    Elevator = 'elevator',
    Nursery = 'nursery',
    Sauna = 'sauna',
    Playground = 'playground',
    GYM = 'gym',
    Dobby = 'dobby',
    PublicBallroom = 'public_ballroom',
    PublicEventSpace = 'public_event_space',
    Security = 'security',
    Salon = 'salon',
    Parking = 'parking',
    Cafe = 'café',
    ConvenienceStore = 'convenience_store',
    ShuttleBus = 'shuttle_bus',
    Concierge = 'concierge',
    VisitorParking = 'visitor_parking',
    BadmintonCourt = 'badminton_court',
    Tennis = 'tennis',
    LaundryRoom = 'laundry_room',
    Restaurant = 'restaurant',
    JoggingTrack = 'jogging_track',
}

export enum UtilityType {
    Wifi = 'wifi',
    Electricity = 'electricity',
    Water = 'water',
}

export enum UtilityIncluded {
    Included = 'included',
    NotIncluded = 'not_included',
    NotAvailable = 'not_available',
}

export enum POIType {
    PetrolStation = 'petrol_station',
    Bank = 'bank',
    Accessibility = 'accessibility',
    Monorail = 'monorail', // DEPRECATE in favour of Train
    Park = 'park',
    School = 'school',
    Supermarket = 'supermarket',
    ShoppingMall = 'shopping_mall',
    Train = 'train',
}

export enum HouseRule {
    Smoking = 'smoking',
    Pets = 'pets',
    Cooking = 'cooking',
}

export enum TopFeature {
    HalalFriendlyUnit = 'halal_friendly_unit',
    NonSmoking = 'non_smoking',
    WithWindow = 'with_window',
    ZeroDeposit = 'zero_deposit',
}

export enum RoomType {
    Private = 'private',
    Shared = 'shared',
    Master = 'master',
    Medium = 'medium',
    Small = 'small',
}

export enum BathroomType {
    Shared = 'shared',
    Private = 'private',
}

export enum GenderRule {
    MixedGender = 'mixed_gender',
    FemaleOnly = 'female_only',
    MaleOnly = 'male_only',
}

export enum ListingTag {
    RentToOwn = 'rent_to_own',
}