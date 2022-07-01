export enum EmailTemplate {
    passwordReset = '8-reset-password',
    tenantSignup = '1-tenant-signed-up',
    agentSignup = '7-agent-signed-up',
    moveInReminder = '6-tenant-reminder',
    tenantBookingSent = '2.1/tenant_booking_sent',
    tenantBookingAccepted = '3.1/tenant_booking_accepted',
    tenantBookingRejected = '4-tenant-reservation-rejected',
    tenantPaid = '5/tenant_paid_signed',
    landlordBookingAccepted = '9-landlord-reservation',
    b2bPartnerSignup = '11/b2b_signed_up',
    landlordSignup = '10/landlord_signed_up',
}

export enum EmailPurpose {
    bookingPaymentSucess = 'Booking Payment Success Notification',
    depositPaymentSucess = 'Deposit Payment Success Notification'
}
