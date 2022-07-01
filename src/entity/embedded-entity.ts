import { Column } from 'typeorm';
import { AbstractEmbeddedEntity } from './abstract.entity';

export class AddressDto extends AbstractEmbeddedEntity implements IAddress {
    buildingName?: string;
    fullUnitNumber?: string;
    block?: string;
    floor?: string;
    unitNo?: string;
    streetLine1?: string;
    streetLine2?: string;
    area?: string;
    subArea?: string;
    state?: string;
    postcode?: string;
    country?: string;
    countryCode?: string;
}

export class Address extends AbstractEmbeddedEntity {
    @Column({ name: 'full_unit_number', type: 'varchar', length: 100, default: '' })
    fullUnitNumber: string;

    @Column({ name: 'block', type: 'varchar', length: 100, default: '' })
    block: string;

    @Column({ name: 'floor', type: 'varchar', length: 100, default: '' })
    floor: string;

    @Column({ name: 'unit_no', type: 'varchar', length: 100, default: '' })
    unitNo: string;
}

export class StatusResponse {
    success: boolean;
    message: string;
}

export interface IAddress {
    buildingName?: string;
    fullUnitNumber?: string;
    block?: string;
    floor?: string;
    unitNo?: string;
    streetLine1?: string;
    streetLine2?: string;
    subArea?: string;
    area?: string;
    state?: string;
    postcode?: string;
    country?: string;
    countryCode?: string;
}