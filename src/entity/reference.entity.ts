import { AbstractEntity } from './abstract.entity';
import { Column, DeepPartial, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

import { ReferenceType } from '../enums/reference.enum';

@Entity('references')
@Index(['country', 'type', 'code'], { unique: true })
export class Reference extends AbstractEntity {
    @PrimaryGeneratedColumn()
    id: number;
    @Column({ type: 'char', length: 2, nullable: false })
    country: string;
    @Column({ type: 'int', unsigned: true, nullable: false })
    type: number;
    @Column({ type: 'int', unsigned: true, nullable: false })
    code: number;
    @Column({ type: 'json', nullable: true })
    value: Record<string, any> | null;

    constructor(input?: DeepPartial<Reference>) {
        super(input);
    }
}

export class ReferenceCollection {
    private collection: Map<number, Map<number, Reference>>;

    constructor(references: Reference[]) {
        this.collection = references.reduce((r, v) => {
            if (!r.has(v.type)) {
                r.set(v.type, new Map<number, Reference>());
            }

            r.set(v.type, r.get(v.type).set(v.code, v));

            return r;
        }, new Map<number, Map<number, Reference>>());
    }

    getReferences(type: ReferenceType): Map<number, Reference> | undefined {
        return this.collection.get(type);
    }

    getReference(type: ReferenceType, code: number): Reference | undefined {
        return this.collection.get(type)?.get(code);
    }
}
