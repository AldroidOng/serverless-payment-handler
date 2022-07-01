import { AbstractEntity } from './abstract.entity';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Email extends AbstractEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'varchar', nullable: false })
    recipient: string;

    @Column({ type: 'varchar', nullable: false })
    type: string;

    @Column({ type: 'json', nullable: true })
    payload: object;

    @Column({ type: 'json', nullable: true })
    response: object;
}
