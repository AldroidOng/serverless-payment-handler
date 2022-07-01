export enum BankMethod {
    mandate = '00',
    instantPay = '01',
}

export enum PaymentFlowMethod {
    createForm = '00',
    createFormSave = '01',
    createFormQR = '02',
    createFormFPX = '03',
}

export enum PaymentMethod {
    onlineBanking = '1',
    creditCard = '2',
}

export enum PaymentPurpose {
    deposit = 'deposit',
    mandate = 'mandate',
    rental = 'rental',
    initial = 'initial',
}

export enum PaymentSource {
    fpx = 'fpx',
    directDebit = 'directDebit',
    manual = 'manual',
    manualToInstahome = 'manualToInstahome',
    manualToLandlord = 'manualToLandlord',
}

export enum PaymentItemType {
    rental = 'rental',
    advanceRental = 'advanceRental',
    endRental = 'endRental',
    rentalDeposit = 'rentalDeposit',
    utilityDeposit = 'utilityDeposit',
    miscellaneousDeposit = 'miscellaneousDeposit',
    tenancyAgreementFee = 'tenancyAgreementFee',
    stampingFee = 'stampingFee',
    tenancyAgreementFeeAndStampingFee = 'tenancyAgreementFeeAndStampingFee',
    depositFee = 'depositFee',
    sstAmount = 'sstAmount',
    sstPercent = 'sstPercent',
}

export enum PaymentStatus {
    pending = 'pending',
    success = 'success',
    cancel = 'cancel',
    fail = 'fail',
}

export enum CurlecUserDocumentType {
    passportNumber = 'PASSPORTT_NUMBER',
    ic = 'NRIC',
    oldIc = 'OLD_IC',
    bussinessRegistration = 'BUSINESS_REGISTRATION_NUMBER',
    other = 'OTHERS',
}

export enum CurlecStatusCheckMethod {
    mandate = '00',
    instantPay = '01',
    enrollment = '02',
    collection = '05',
}
