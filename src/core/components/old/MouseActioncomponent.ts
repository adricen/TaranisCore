import type { IComponent } from "@/core/components/old/Component";

class MouseStateComponent implements IComponent {
    mouseDown: boolean = false;
    mouseUp: boolean = true;
    // TODO: 
    // maybe drag, touch, move...
    constructor({
        mouseDown = false,
        mouseUp = true,
    }: Partial<MouseStateComponent>) {
        this.mouseDown = mouseDown;
        this.mouseUp = mouseUp;
    }
}

export { MouseStateComponent };
