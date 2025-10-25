import { Position, HTMLElementComponent } from "commons/components";
import type { ISystem } from "commons/typescript";
import type { ECS } from "@/core/ECS-old";
// TODO: Deal with mouse outside of the canvas
// Could be a render improvement
class MousePositionSystem implements ISystem {
    private canvas: HTMLCanvasElement;
    private mouseX: number = 0;
    private mouseY: number = 0;
    
    // TODO: could also work for touch events
    constructor(ecs: ECS) {
        const canvasEntity = ecs.getEntitiesWithTags(['canvas']); // Ensure mouse entity exists
        if(!canvasEntity) {
            throw new Error("MousePositionSystem: No canvas entity found. Make sure to add a canvas entity before adding the MousePositionSystem.");
        }
        const canvas = canvasEntity[0].components.get(HTMLElementComponent.prototype.constructor.name) as HTMLElementComponent;
        if (!canvas || !canvas.element) {
            throw new Error("MousePositionSystem: Canvas component not found on the canvas entity.");
        }
        this.canvas = canvas.element as HTMLCanvasElement;
        this.canvas.addEventListener('mousemove', this.handleMouseMove);
    }
    
    update(ecs: ECS): void {
        const mouseEntity = ecs.getEntitiesWithTags(['mouse']);
        if (!mouseEntity.length) return;
        
        // Update the Position component of the mouse entity
        const position = mouseEntity[0].components.get(Position.prototype.constructor.name) as any;
        if (!position)  return;
        position.x = this.mouseX;
        position.y = this.mouseY;
    }
    
    dispose() {
        this.canvas.removeEventListener('mousemove', this.handleMouseMove);
    }
    
    private handleMouseMove = (event: MouseEvent) => {
        const rect = this.canvas.getBoundingClientRect();
        this.mouseX = event.clientX - rect.left;
        this.mouseY = event.clientY - rect.top;
    }

}

export { MousePositionSystem };