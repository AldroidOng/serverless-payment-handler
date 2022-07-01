import "reflect-metadata";
import { CreateDateColumn, DeepPartial, DeleteDateColumn, UpdateDateColumn } from 'typeorm';

export abstract class AbstractEntity {
    protected constructor(input?: DeepPartial<AbstractEntity>) {
        if (input) {
            for (const [key, value] of Object.entries(input)) {
                (this as any)[key] = value;
            }
        }
    }

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @DeleteDateColumn()
    deletedAt: Date;
}

export abstract class AbstractEmbeddedEntity { }
