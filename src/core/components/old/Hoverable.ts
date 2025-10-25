import type { IComponent } from "@/core/components";

class Hoverable implements IComponent {
    isHovered: boolean = false;
    constructor({ isHovered = false }: Partial<Hoverable> = {}) {
        this.isHovered = isHovered;
    }
}

export { Hoverable };