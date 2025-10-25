import { CanvasContext2D, HTMLElementComponent, Position } from "commons/components";
import type { ISystem } from "commons/typescript";
import type { ECS } from "@/core/ECS-old";

/**
 * The RenderSystem is responsible for rendering the game entities on the canvas.
 */
// TODO: test this file
// Add a minimum loop behavior for idle state (clear, background color, etc.)
class RenderSystem implements ISystem {

    private canvas: HTMLCanvasElement | null = null;
    private context: CanvasRenderingContext2D | null = null;

    constructor(ecs: ECS) {
         // Find the canvas entity
        const canvasEntity = ecs.getEntitiesWithTags(['canvas'])[0];
        if (!canvasEntity) {
            throw new Error("No canvas entity found in the ECS.");
        }
        const htmlElementComponent = canvasEntity.components.get(HTMLElementComponent.prototype.constructor.name);
        if (!htmlElementComponent || !(htmlElementComponent.element instanceof HTMLCanvasElement)) {
            throw new Error("Canvas entity does not have a valid HTMLElementComponent with a canvas element.");
        }
    
        this.canvas = htmlElementComponent.element;
        // Get the CanvasRenderingContext2D
        const canvasContextComponent = canvasEntity.components.get(CanvasContext2D.prototype.constructor.name) as CanvasContext2D;
    
        if (canvasContextComponent && canvasContextComponent.context) {
            this.context = canvasContextComponent.context;
            return;
        }
    
        this.context = this.canvas?.getContext('2d') ?? null;
        if (!this.context) {
            throw new Error("Failed to get 2D rendering context from the canvas.");
        }
    }
 
    /**
     * Updates the render system.
     * @param ecs The ECS instance.
     * @param deltaTime The time elapsed since the last update - optional
     */
    update(ecs: ECS, deltaTime?: number): void {
        if (!this.context) return;

        // Clear the canvas
        this.context.clearRect(0, 0, this.canvas!.width, this.canvas!.height);

        // Call the abstract render method for custom rendering logic
        this.render(ecs, this.context, deltaTime);
    }

    protected render(ecs: ECS, ctx: CanvasRenderingContext2D, deltaTime?: number) {
        // Default rendering logic (can be overridden by subclasses)
        ecs.getEntitiesWithComponents([Position])?.forEach(entity => {
            const position = entity.components.get('Position') as { x: number; y: number; };
            // actually draw mouse
            if (position) {
                ctx.fillStyle = 'red';
                ctx.fillRect(position.x - 5, position.y - 5, 10, 10);
                
            }
            if (!deltaTime) return;
            ctx.fillText(`${deltaTime.toFixed(4)}`, position.x + -15, position.y - 10);

        })
            // Example: Render entities with a position and size component
    };  
}

export { RenderSystem };