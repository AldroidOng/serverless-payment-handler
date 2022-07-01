import { AbstractEntity } from './abstract.entity';
import { Column, DeepPartial, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

import { Promotion } from './promotion.entity';
import { DiscountCategory, DiscountType } from '../enums/promotion.enum';

@Entity('discounts')
export class Discount extends AbstractEntity {
    constructor(input?: DeepPartial<Discount>) {
        super(input);
    }

    @PrimaryGeneratedColumn()
    id?: number;

    @ManyToOne((type) => Promotion, (promotion) => promotion.discounts, { onDelete: 'CASCADE' })
    @JoinColumn()
    promotion: Promotion;

    @Column({ type: 'enum', enum: DiscountCategory, nullable: false })
    category: DiscountCategory;

    @Column({ type: 'int', nullable: false, default: 1 })
    occurance: number;

    @Column({ type: 'float', nullable: false })
    discount: number;

    @Column({ type: 'enum', enum: DiscountType, nullable: false })
    discountType: DiscountType;

    @Column({ type: 'float', nullable: true })
    maxDiscount?: number;
}
