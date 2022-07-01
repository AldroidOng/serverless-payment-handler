import { AbstractEntity } from './abstract.entity';
import { Column, DeepPartial, Entity, JoinColumn, ManyToMany, OneToMany, OneToOne, PrimaryGeneratedColumn } from 'typeorm';

import { Discount } from './discount.entity';
import { PromotionStatus } from '../enums/promotion.enum';

export class PromoCodesUrl {
    name: string;
    url: string;
    key: string;
}

@Entity('promotions')
export class Promotion extends AbstractEntity {
    constructor(input?: DeepPartial<Promotion>) {
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

    @Column({ type: 'json', nullable: true })
    promoCodesUrls: PromoCodesUrl[];

    @Column({ type: 'date', nullable: false })
    startDate: string;

    @Column({ type: 'date', nullable: false })
    endDate: string;

    @Column({ type: 'enum', enum: PromotionStatus, nullable: false, default: PromotionStatus.PENDING })
    status: PromotionStatus;

    @OneToMany((type) => Discount, (discount) => discount.promotion, { cascade: true })
    discounts: Discount[];
}
