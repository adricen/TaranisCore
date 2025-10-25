import { EntityTypeMask } from "@/core/utils/EntityTypeMask";
import { TransformMask } from "@/core/bitmasks/TransformMask";
import type { ECS } from "@/core/ECS";

function Mouse2DFactory<E extends ECS>(
    ecs: E,
): number {
    const entityId = ecs.createEntity(EntityTypeMask.Mouse);
    ecs.addComponent(entityId, 'Transform', TransformMask.Position, {x: 0, y: 0, z: 0},);
    // TODO: State manager
    return entityId;
}

export { Mouse2DFactory };