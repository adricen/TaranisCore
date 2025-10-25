import type { ECS } from "@/core/ECS";
import type { System } from "@/core/systems/System";
import { EntityTypeMask } from "../utils/EntityTypeMask";
import { CoreMask } from "../bitmasks/CoreMask";
import type { HtmlElementContainer } from "../components/HtmlElementContainer";

/**
 * The RenderSystem is responsible for rendering the game entities on the canvas.
 */
// TODO: test this file
// Add a minimum loop behavior for idle state (clear, background color, etc.)
class RenderSystem implements System {

    protected ecs: ECS;
    protected canvas: HTMLCanvasElement | null = null;
    protected context: CanvasRenderingContext2D | null = null;

    constructor(ecs: ECS) {
        this.ecs = ecs;
        // Canvas
        const canvasEntity = ecs.getFirstEntityByMask(EntityTypeMask.Canvas);
        if (!canvasEntity) {
            throw new Error("No canvas entity found in the ECS.");
        }
        this.canvas = (ecs.getComponent(canvasEntity, 'Core', CoreMask.HtmlElement) as HtmlElementContainer)?.element as HTMLCanvasElement || null;
        if (!this.canvas) {
            throw new Error('Canvas entity does not have a valid HTMLCanvasElement in its HtmlElementContainer component.');
        }
        this.context = this.canvas.getContext('2d') ?? null;
        if (!this.context) {
            throw new Error("Failed to get 2D rendering context from the canvas.");
        }
    }
 
    /**
     * Updates the render system.
     * @param ecs The ECS instance.
     * @param deltaTime The time elapsed since the last update - optional
     */
    update(deltaTime?: number): void {
        
    }

    protected render() {
        
    };  
    dispose(): void {
        // Clean up resources if needed
    }
}

export { RenderSystem };