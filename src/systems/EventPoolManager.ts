import type { IEvent } from "@/core/components";
import type { TEventMap } from "./typescript/TEventMap";

class EventPoolManager {
    private eventPool: IEvent[] = [];

    getEvent<K extends keyof TEventMap>(
        name: K,
        order: number = 0,
        ...args: TEventMap[K] extends unknown[] ? TEventMap[K] : [TEventMap[K]]
    ): IEvent {
        if (this.eventPool.length > 0) {
            const event = this.eventPool.pop()!;
            event.name = name;
            event.args = args as TEventMap[K];
            event.order = order;
            return event;
        }
        return { name, order, args: args as TEventMap[K] };
    }

    recycleEvent(event: IEvent): void {
        this.eventPool.push(event);
    }
}

export const eventPoolManager = new EventPoolManager();