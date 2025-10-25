import type { IComponent } from "@/core/components";

class HTMLElementComponent implements IComponent {
    element: HTMLElement | null;

    constructor({element = null}: Partial<HTMLElementComponent> = {}) {
        this.element = element;
    }
}

export { HTMLElementComponent };