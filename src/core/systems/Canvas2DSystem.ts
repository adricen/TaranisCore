import { EntityTypeMask } from "@/core/utils/EntityTypeMask";
import { System } from "@/core/systems/System";
import { CoreMask } from "@/core/bitmasks/CoreMask";
import type { ECS } from "@/core/ECS";
import type { HtmlElementContainer } from "@/core/components/HtmlElementContainer";

class Canvas2DSystem<E extends ECS> implements System {
    protected ecs: E;
    canvas: HTMLCanvasElement | null = null;
    
    constructor(ecs: E) {
        this.ecs = ecs;
        // Check if entity Canvas mask exist
        const canvasEntity = ecs.getFirstEntityByMask(EntityTypeMask.Canvas);
        if (canvasEntity === null) {
            throw new Error('No entity with Canvas mask found.\nPlease create one before initializing CanvasLinkSystem.\nYou can use the utility Canvas2DFactory to create a canvas entity.');
        }
        this.canvas = (ecs.getComponent(canvasEntity, 'Core', CoreMask.HtmlElement) as HtmlElementContainer)?.element as HTMLCanvasElement || null;
        if (!this.canvas) {
            throw new Error('Canvas entity does not have a valid HTMLCanvasElement in its HtmlElementContainer component.');
        }
        
        this.handleResize();
        window.addEventListener('resize', this.handleResize);
    }

    update(): void { }

    handleResize = (): void => {
        this.canvas?.setAttribute('width', window.innerWidth.toString());
        this.canvas?.setAttribute('height', window.innerHeight.toString());
    }

    dispose(): void {
        window.removeEventListener('resize', this.handleResize)
    }
}

export { Canvas2DSystem };