import type { IComponent } from "@/core/components";

class CanvasContext2D implements IComponent {
    context: CanvasRenderingContext2D | null;
    

    constructor({context = null}: Partial<CanvasContext2D> = {}) {
        this.context = context;
    }
}

export { CanvasContext2D };