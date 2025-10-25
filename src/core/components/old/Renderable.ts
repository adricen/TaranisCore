import type { IComponent } from "@/core/components/old/Component";

class Renderable implements IComponent {
    public symbol: string;
    public color: string;
    public size: number;

    constructor({symbol = "", color = "#fff", size = 25}: Partial<Renderable> = {}) {
        this.symbol = symbol;
        this.color = color;
        this.size = size;
    }
}

export { Renderable };
