import { v4 } from 'uuid';

import { PrimaryKey, Property } from '@mikro-orm/core';

export abstract class BaseEntity {
    @PrimaryKey()
    id: string = v4();

    @Property({ onUpdate: () => new Date().toISOString().slice(0, 19).replace("T", " ") })
    createdAt: Date = new Date();

    @Property({ onUpdate: () => new Date().toISOString().slice(0, 19).replace("T", " ") })
    updatedAt: Date = new Date();
}
