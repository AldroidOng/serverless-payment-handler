import { AbstractEntity } from './abstract.entity';
import { Column, DeepPartial, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('signature_agreement_template')
export class ESignAgreement extends AbstractEntity {
    constructor(input?: DeepPartial<ESignAgreement>) {
        super(input);
    }

    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: "varchar", length: 255, nullable: true })
    templateId: string;

    @Column({ type: "varchar", length: 255, nullable: true })
    name: string;
}
