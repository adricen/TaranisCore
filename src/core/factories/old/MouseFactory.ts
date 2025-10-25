import { MouseStateComponent, Position  } from "commons/components";
import { EmitterComponent } from "@/core/EventSystem/components";
import type { ECS } from "@/core/ECS-old";
import type { IEntity } from "commons/typescript";

function MouseFactory(ecs: ECS): IEntity['id'] {
    const mouseEntityId = ecs.createEntity();

    ecs.addTag(mouseEntityId, 'mouse');

    // Ajouter les composants de base
    ecs.addComponent(mouseEntityId, Position, {}); // Position initiale
    ecs.addComponent(mouseEntityId, MouseStateComponent, { mouseDown: false }); // État initial du clic
    ecs.addComponent(mouseEntityId, EmitterComponent, {});
    // Ajouter d'autres composants si nécessaire
    // mouseEntity.addComponent(new Hoverable(false));

    return mouseEntityId;
}

export { MouseFactory };