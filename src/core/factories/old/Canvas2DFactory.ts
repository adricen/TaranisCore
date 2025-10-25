import { Dimension, CanvasContext2D, HTMLElementComponent } from "commons/components";
import { EmitterComponent, ListenerComponent } from "@/core/EventSystem/components/";
import { EventNamesEnum } from "core/EventSystem/typescript";
import type { IEntity } from "commons/typescript";
import type { ECS } from "../ECS";

function Canvas2DFactory( ecs: ECS, dimensions?: Dimension ): IEntity['id'] {

    const canvasEntityId = ecs.createEntity();
    ecs.addTag(canvasEntityId, 'canvas');
    // TODO: Resize Context
    // Ajouter les composants de base
    ecs.addComponent(canvasEntityId, Dimension, { width, height }); // Dimension du canvas
    ecs.addComponent(canvasEntityId, HTMLElementComponent, { element: null }); // Élément HTML du canvas
    ecs.addComponent(canvasEntityId, CanvasContext2D, { context: null }); // Contexte du canvas
    ecs.addComponent(canvasEntityId, EmitterComponent, {}); // Pour émettre des événements liés au canvas
    ecs.addComponent(canvasEntityId, ListenerComponent, {
        listen: new Map([
            [
                EventNamesEnum.CanvasResize,
                [
                    (args: Dimension) => {
                        console.log(`Event: ${EventNamesEnum.CanvasResize}`, args);
                    }
                ]
            ]
        ])
    });
    
    return canvasEntityId;
}

export { Canvas2DFactory };