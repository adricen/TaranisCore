import { EmitterComponent, ListenerComponent } from "@/core/EventSystem/components/";
import { eventPoolManager } from "@/core/EventSystem/EventPoolManager";
import type { ISystem } from "commons/typescript";
import type { IEvent } from "@/core/EventSystem/typescript";
import type { ECS } from "@/core/ECS-old";

class EventSystem implements ISystem {

    update(ecs: ECS): void {
        const eventsToProcess: Array<IEvent> = [];
        
        // Let's start by processing emitters
        ecs.getEntitiesWithComponents([EmitterComponent])?.forEach((entity) => {
            const emitter = entity.components.get(EmitterComponent.prototype.constructor.name) as EmitterComponent;
            eventsToProcess.push(...emitter.clearEmitterList());
        });
        eventsToProcess?.sort((a, b) => (b.order ?? 0) - (a.order ?? 0));
        eventsToProcess.reverse();

        // Then, we handle listeners
        ecs.getEntitiesWithComponents([ListenerComponent])?.forEach((entity) => {
            const listener = entity.components.get(ListenerComponent.prototype.constructor.name) as ListenerComponent;
            for (let i = eventsToProcess.length - 1; i >= 0; i--) {
                const event = eventsToProcess.pop()!;
                const callBacksArray = listener.listen.get(event.name);
                callBacksArray?.forEach((callback) => {
                    callback(event.args);
                });
                eventPoolManager.recycleEvent(event);
            }
            return;
        });
        // Recycle Fired event if nothing have been processed
        for (let i = eventsToProcess.length - 1; i >= 0; i--) {
            const event = eventsToProcess.pop()!;
            eventPoolManager.recycleEvent(event);
        }
    }

    destroy(): void {}
}

export { EventSystem };