import { ListenerComponent } from "@/core/EventSystem/components";
import { EventNamesEnum } from "@/core/EventSystem/typescript";
import type { ECS } from "../ECS";

function EventLoggerFactory(ecs: ECS, eventName?: EventNamesEnum[]): string {
    // Log all events by default
    const eventsToLog = eventName ?? Object.values(EventNamesEnum); 

    const listenerEntityId = ecs.createEntity();
    ecs.addTag(listenerEntityId, 'event-logger');

    ecs.addComponent(listenerEntityId, ListenerComponent, {
        listen: new Map(
            eventsToLog.map((event) => [
                event,
                [
                    (args: any) => {
                        console.log(`Event: ${event}`, args);
                    },
                ],
            ])
        ),
    });
    
    return listenerEntityId;
}
export { EventLoggerFactory };