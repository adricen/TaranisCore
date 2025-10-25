import { eventPoolManager } from "@/core/EventSystem/EventPoolManager";
import type { IComponent } from "commons/typescript";
import type { TEventMap, IEvent } from "@/core/EventSystem/typescript/";


// TODO: Maybe find a way to prioritize events even if they are in another order
class EmitterComponent implements IComponent {
    emitList: Array<IEvent>;

    constructor({
        emitList = [],
    }: Partial<EmitterComponent>) {
        this.emitList = emitList;
    }

    emit<K extends keyof TEventMap>(
        name: IEvent['name'],
        order: IEvent['order'] = 0,
        ...args: TEventMap[K] extends unknown[] ? TEventMap[K] : [TEventMap[K]]
    ) {
        const event = eventPoolManager.getEvent(name, order, args as TEventMap[K]);
        if (!event) {
            throw new Error(`Failed to retrieve event from pool: ${name}`);
        }
        this.emitList.push(event);
    }

    clearEmitterList() {
        const clearedList = this.emitList.slice();
        this.emitList.length = 0;
        return clearedList;
    }
}

export { EmitterComponent };