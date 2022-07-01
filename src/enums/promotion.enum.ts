export enum DiscountCategory {
    RENTAL = 'rental',
    SECURITY_DEPOSIT = 'security_deposit',
    UTILITY_DEPOSIT = 'utility_deposit',
    ADVANCE_RENTAL = 'advance_rental',
}

export enum DiscountType {
    PERCENTAGE = 'percentage',
    NUMERIC = 'numeric',
}

export enum PromotionType {
    ONE_TIME_USE = 'one_time_use',
    PERIOD_USE = 'period_use',
}


export enum PromotionStatus {
    PENDING = 'pending',
    ACTIVE = 'active',
    INACTIVE = 'inactive',
}


export enum PromotionCodeStatus {
    ACTIVE = 'active',
    INACTIVE = 'inactive',
}