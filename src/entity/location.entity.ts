import { AbstractEntity } from './abstract.entity';
import { Column, DeepPartial, Entity, JoinColumn, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

import { Property } from './property.entity';

@Entity('locations')
export class Location extends AbstractEntity {
    constructor(input?: DeepPartial<Location>) {
        super(input);
    }

    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: 'int', nullable: false, default: -1 })
    parentId: number;

    @Column({ type: 'int', nullable: false })
    level: number;

    @Column({ type: 'json', nullable: false })
    name: Record<string, any>;

    @Column({ type: 'varchar', nullable: false })
    slug: string;

    @Column({ type: 'json', nullable: false })
    description: Record<string, any>;

    @Column({ type: 'int', nullable: true })
    propertyType: number;

    @Column({ type: 'int', nullable: true })
    propertyGroupType: number;

    @Column({ type: 'json', nullable: true })
    streetAddress: Record<string, any>;

    @Column({ type: 'json', nullable: false })
    address: Record<string, any>;

    @Column({ type: 'varchar', nullable: true })
    postcode: string;

    @Column({ type: 'varchar', nullable: false })
    country: string;

    @Column({ type: 'varchar', nullable: true, insert: false, update: false })
    enArea: string;

    @Column({ type: 'varchar', nullable: false })
    countryCode: string;

    @Column({ type: 'double', nullable: true })
    longitude: number;

    @Column({ type: 'double', nullable: true })
    latitude: number;

    @Column({ type: 'json', nullable: true })
    photoUrls: string[];

    @Column({ type: 'int', nullable: false, default: 0 })
    listingCount: number;

    @OneToMany(() => Property, (property) => property.location)
    @JoinColumn()
    properties?: Property[];
}
