'use client';

import { UIObject } from '@/lib/UIObject';

export class UIManager {
    objects: UIObject[];

    constructor() {
        this.objects = [];
    }

    addObject(object: UIObject) {
        this.objects.push(object);
    }

    removeObject(objectId: string) {
        this.objects = this.objects.filter(obj => obj.id !== objectId);
    }

    updateObjects() {
        this.objects.forEach(obj => obj.update());
    }

    resetAll() {
        this.objects.forEach(obj => obj.reset());
    }
}