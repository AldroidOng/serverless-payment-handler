import { Column, DeepPartial, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

import { AbstractEntity } from './abstract.entity';

@Entity('photographers')
export class Photographer extends AbstractEntity {
    constructor(input?: DeepPartial<Photographer>) {
        super(input);
    }

    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: 'varchar', length: 100, nullable: false })
    name: string;

    @Column({ type: 'varchar', length: 2000, nullable: true })
    avatarUrl: string;
}
