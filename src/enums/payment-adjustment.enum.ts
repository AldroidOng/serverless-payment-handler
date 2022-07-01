export enum PaymentAdjustmentOperation {
    add = 'add',
    deduct = 'deduct',
}

export enum PaymentAdjustmentType {
    deposit = 'deposit',
    lateFee = 'late_fee',
    rental = 'rental',
    initial = 'initial',
}

export enum PaymentAdjustmentAction {
    adjustment = 'adjustment',
    complete = 'complete',
}