import "reflect-metadata";
import { UserRole } from '../enums/user.enums';
import { AbstractEntity } from './abstract.entity';
import { Column, DeepPartial, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity("test")
export class Test {
    @PrimaryGeneratedColumn('uuid', { name: "idtest" })
    idtest: string;

    // @Column({ unique: true })
    // profileId: string;

    // @Column()
    // countryCode: string;

    // @Column({ unique: true })
    // phoneNumber: string;

    // @Column({ default: false })
    // verified: boolean;

    // @Column({ default: false })
    // suspended: boolean;

    // @Column({ length: 255, nullable: true })
    // name?: string;

    // @Column({ length: 120, nullable: true })
    // firstName?: string;

    // @Column({ length: 120, nullable: true })
    // lastName?: string;

    // @Column({ length: 255, nullable: true })
    // renTag?: string;

    // @Column({ type: 'enum', enum: UserRole })
    // role?: UserRole;

    // @Column()
    // password: string;

    // @Column({ length: 3, nullable: true })
    // country?: string;

    // @Column({ nullable: true })
    // crmUserId?: string;

    // nationality?: string;

    // occupation?: string;

    // companyInstitution?: string;

    // @Column({ nullable: true })
    // isTmpPassword?: boolean;

    // source?: string;

    // referrer?: string;

    // focusType?: string;

    // focusArea?: string;

    // @Column({ type: 'varchar', length: 255, nullable: true })
    // paymentMethod?: string;

    // @Column({ type: 'text', nullable: true })
    // notes?: string;

    // @Column({ nullable: true })
    // passwordUpdateAt?: Date;

    // @Column({ name: 'whatsapp_link', type: 'varchar', length: 255, nullable: true })
    // whatsappLink?: string;

}
