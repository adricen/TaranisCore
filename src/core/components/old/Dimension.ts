import type { IComponent } from "@/core/components";

class Dimension implements IComponent {
    width: number;
    height: number;
    depth?: number;

    constructor({ width = 0, height = 0, depth = 0 }: Partial<Dimension> = {}) {
        this.width = width; 
        this.height = height;
        this.depth = depth;
    }
}

export { Dimension };