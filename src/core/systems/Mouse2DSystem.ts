import { EntityTypeMask } from "@/core/utils/EntityTypeMask";
import { CoreMask } from "@/core/bitmasks/CoreMask";
import { TransformMask } from "@/core/bitmasks/TransformMask";
import type { System } from "@/core/systems/System";
import type { ECS } from "@/core/ECS";
import type { HtmlElementContainer } from "@/core/components/HtmlElementContainer";
import type { Position } from "@/core/components/Position";

class Mouse2DSystem<T extends ECS> implements System {
    
    protected ecs: T;
    protected canvas?: HTMLCanvasElement;

    constructor(ecs: T) {
        this.ecs = ecs;
        const canvasId = this.ecs.getFirstEntityByMask(EntityTypeMask.Canvas)
        this.canvas = (this.ecs.getComponent(canvasId!, 'Core', CoreMask.HtmlElement ) as HtmlElementContainer)?.element as HTMLCanvasElement;
        if (!this.canvas) {
            throw new Error('MouseSystem2D: No entity with Canvas mask found.\nPlease create one before initializing MouseSystem2D.\nYou can use the utility CanvasFactory to create a canvas entity.');
        }
        this.canvas.addEventListener('mousemove', this.updatePosition)
    }

    updatePosition = (event: MouseEvent): void => {
        const mouseEntityId = this.ecs.getFirstEntityByMask(EntityTypeMask.Mouse);
        if (!mouseEntityId) {
            throw new Error('MouseSystem2D: No entity with Mouse mask found.\nPlease create one before initializing MouseSystem2D.\nYou can use the utility MouseFactory to create a mouse entity.');
        }
        const position = this.ecs.getComponent(mouseEntityId, 'Transform', TransformMask.Position ) as Position;
        if (!position) return 
        position.x = event.clientX;
        position.y = event.clientY;
    }

    update(): void {
        const mouseEntityId = this.ecs.getFirstEntityByMask(EntityTypeMask.Mouse);
        if (!mouseEntityId) {
            throw new Error('MouseSystem2D: No entity with Mouse mask found.\nPlease create one before initializing MouseSystem2D.\nYou can use the utility MouseFactory to create a mouse entity.');
        }
    }

    dispose(): void {
        this.canvas?.removeEventListener('mousemove', this.updatePosition);
    }
}

export { Mouse2DSystem };