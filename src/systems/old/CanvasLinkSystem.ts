import { Dimension, HTMLElementComponent } from "commons/components";
import {EmitterComponent } from "@/core/EventSystem/components";
import type { ECS } from "@/core/ECS-old";
import type { ISystem } from "commons/typescript";

class CanvasLinkSystem implements ISystem {
    
    private actualWidth: number = window.innerWidth;
    private actualHeight: number = window.innerHeight;

    constructor(ecs: ECS, canvas: HTMLCanvasElement) {
        // Find the canvas entity
        const canvasEntity = ecs.getEntitiesWithTags(['canvas'])[0];
        if (!canvasEntity) return;
    
        // Link the HTML canvas element to the CanvasElement component
        const canvasComponent = canvasEntity.components.get(HTMLElementComponent.prototype.constructor.name);
        const canvasEmitter = canvasEntity.components.get(EmitterComponent.prototype.constructor.name);
        const canvasDimension = canvasEntity.components.get(Dimension.prototype.constructor.name);
        if (canvasComponent) {
            canvasComponent.element = canvas;
            if (canvasDimension) {
                canvasComponent.element.width = canvasDimension.width;
                canvasComponent.element.height = canvasDimension.height;
            }
            if (canvasEmitter) {
                canvasEmitter.emit('canvas:linked', 1, canvas);
            }
        } else {
            if (canvasEmitter) {
                canvasEmitter.emit('canvas:linked', 1, new Error('Canvas component not found'));
            }
        }
        // FIXME: Pour le moment ne fonctionne pas
        window.addEventListener('resize', this.handleResize)
    }
    /**
     * 
     * @param ecs Letr's deal with resize here
     */
    update(ecs: ECS): void {
        // No-op: Linking is handled in initialize
        const canvasEntity = ecs.getEntitiesWithTags(['canvas'])[0];
        if (!canvasEntity) return;
        const canvasDimension = canvasEntity.components.get(Dimension.prototype.constructor.name);
        if (!canvasDimension || canvasDimension?.width === this.actualWidth && canvasDimension?.height === this.actualHeight) return;
        canvasDimension.width = this.actualWidth;
        canvasDimension.height = this.actualHeight;
        this.actualWidth = canvasDimension?.width || 0;
        this.actualHeight = canvasDimension?.height || 0;
    }
    
    handleResize = (): void => {
        this.actualWidth = window.innerWidth;
        this.actualHeight = window.innerHeight;
        console.log('Canvas resized to:', this.actualWidth, this.actualHeight);
    }

    dispose(): void {
        // No-op: Nothing to dispose
    }
}

export { CanvasLinkSystem };