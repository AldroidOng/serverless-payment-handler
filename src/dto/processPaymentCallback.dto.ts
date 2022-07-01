import { Booking } from "src/entity/booking.entity";
import { User } from "src/entity/user.entity";
import { EmailPurpose } from "src/enums/email.enum"

export class SQSContentForEmail {
    emailPurpose: EmailPurpose;
    userEmail: string;
    bookingId: Booking["id"];
}

export class SQSContentForCreateReservationDeal {
    title: string;
    bookingId: Booking["id"];
    crmUserId: User["crmUserId"];
}