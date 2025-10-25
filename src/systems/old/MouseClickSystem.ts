import { MouseStateComponent } from "commons/components";
import { EmitterComponent } from "@/core/EventSystem/components";
import type { ECS } from "@/core/ECS-old";
import type { ISystem } from "commons/typescript";

class MouseClickSystem implements ISystem {
    private canvas: HTMLCanvasElement;
    isClicked: boolean = false;

    // TODO: Left Click also ?
    // TODO: Object entity interaction ? - inside clickSystem
    constructor(ecs: ECS) {
        // Probably I'll bind mouse - or not so it's stay fit on global
        const canvasEntity = ecs.getEntitiesWithTags(['canvas']); // Ensure mouse entity exists
        if(!canvasEntity) {
            throw new Error("MouseClickSystem: No canvas entity found. Make sure to add a canvas entity before adding the MouseClickSystem.");
        }
        const canvas = canvasEntity[0].components.get('HTMLElementComponent') as any;
        if (!canvas || !canvas.element) {
            throw new Error("MouseClickSystem: Canvas component not found on the canvas entity.");
        }
        this.canvas = canvas.element as HTMLCanvasElement;
        // Attach a mousemove event listener to track the mouse position
        this.canvas.addEventListener('mousedown', this.handleClick);
        this.canvas.addEventListener('mouseup', this.handleClick);
    }

    update(ecs: ECS): void {
        if (!this.isClicked) return;
        const mouseEntity = ecs.getEntitiesWithTags(['mouse']);
        if (!mouseEntity.length) return;
        
        const mouseState = mouseEntity[0].components.get(MouseStateComponent.prototype.constructor.name);
        if (!mouseState) return;
        mouseState.mouseDown = this.isClicked;
        mouseState.mouseUp = !this.isClicked;
        mouseEntity[0].components.get(EmitterComponent.prototype.constructor.name)?.emit('mouse:down', 1, mouseState);
    }

    dipsose() {
        this.canvas.removeEventListener('mousedown', this.handleClick);
        this.canvas.removeEventListener('mouseup', this.handleClick);
    }

    private handleClick = (event: MouseEvent) => {
        this.isClicked = event.type === 'mousedown' ? true : false;
    }
}

export { MouseClickSystem };