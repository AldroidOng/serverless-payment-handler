import { AbstractEntity } from './abstract.entity';
import { Column, DeepPartial, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class AdminUser extends AbstractEntity {
    constructor(input?: DeepPartial<AdminUser>) {
        super(input);
    }

    @PrimaryGeneratedColumn('uuid')
    id?: string;

    @Column({ name: "email", type: "varchar", length: 255, unique: true })
    email?: string;

    @Column({ name: "phone", type: "varchar", length: 255, unique: true })
    phone?: string;

    @Column({ name: "is_verified", type: "boolean", default: false })
    isVerified?: boolean;

    @Column({ name: "status", type: "boolean", default: false })
    status?: boolean;

    @Column({ name: "name", type: "varchar", length: 255, nullable: true })
    name?: string;

    @Column({ name: "role", type: "varchar", length: 255, nullable: true })
    role?: string;
}
