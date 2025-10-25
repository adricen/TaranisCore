import { EntityTypeMask } from "@/core/utils/EntityTypeMask";
import { CoreMask } from "@/core/bitmasks/CoreMask";
import type { ECS } from "@/core/ECS";

function Canvas2DFactory<E extends ECS>(
    ecs: E,
    canvas: HTMLCanvasElement,
): number {
    const entityId = ecs.createEntity(EntityTypeMask.Canvas);
    ecs.addComponent(entityId, 'Core', CoreMask.HtmlElement, { element: canvas });
    return entityId;
}

export { Canvas2DFactory };