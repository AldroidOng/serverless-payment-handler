import { AbstractEntity } from './abstract.entity';
import { Column, DeepPartial, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Tag extends AbstractEntity {
    constructor(input?: DeepPartial<Tag>) {
        super(input);
    }

    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: 'varchar', length: 255, nullable: false })
    name: string;

    @Column({ type: 'varchar', length: 255, nullable: false })
    slug: string;

    @Column({ type: 'text', nullable: true })
    description?: string;

    // @ManyToOne((type) => Listing, (listing: Listing) => listing.tags)
    // @JoinColumn()
    // listing?: Listing;
}
