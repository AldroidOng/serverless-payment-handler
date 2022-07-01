import { AbstractEntity } from './abstract.entity';
import { Column, DeepPartial, Entity, ManyToOne, OneToOne, PrimaryGeneratedColumn } from 'typeorm';

import { Booking } from './booking.entity';
import { Promotion } from './promotion.entity';
import { PromotionCodeStatus } from '../enums/promotion.enum';

@Entity('promotion_codes')
export class PromotionCode extends AbstractEntity {
    constructor(input?: DeepPartial<PromotionCode>) {
        super(input);
    }

    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: 'varchar', length: 255, nullable: false, unique: true })
    code: string;

    @Column({ type: 'int', nullable: false, default: 1 })
    usageLimit: number;

    @Column({ type: 'int', nullable: false, default: 0 })
    usageCount: number;

    @Column({ type: 'enum', enum: PromotionCodeStatus, nullable: false, default: PromotionCodeStatus.ACTIVE })
    status: PromotionCodeStatus;

    @ManyToOne((type) => Promotion, (promotion) => promotion.id)
    promotion: Promotion;

    @OneToOne((type) => Booking, (booking) => booking.promotionCode)
    booking: Booking;
}
