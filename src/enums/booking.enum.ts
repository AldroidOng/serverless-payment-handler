export enum BookingStatus {
    IN_PROGRESS = 'in_progress',
    APPROVED = 'approved',
    REJECTED = 'rejected',
    CANCELED = 'canceled',
    BOOKING_PAID = 'booking_paid',
    PAID = 'paid',
    TENANT_SIGNED = 'tenant_signed',
    DEPOSIT_PAID = 'deposit_paid',
}

export enum BookingRelationship {
    PARENT = 'Parent',
    COUPLE = 'Couple',
    KIDS = 'kids',
}


export enum BookingOtherRelationship {
    FRIENDS = 'Friends',
    COLLEAGUE = 'Colleague',
}

export enum BookingSigner {
    LANDLORD = 'landlord',
    TENANT = 'tenant',
}

export enum BookingCollectionType {
    PASS_LEAD = 'pass_lead',
    ROOM_RENTAL = 'room_rental',
    MOVE_OUT = 'move_out',
    DEFAULTED = 'defaulted',
    EARLY_TERMINATION = 'early_termination',
    RENTAL_THROUGH_INSTAHOME = 'rental_through_instahome',
}