import type { Component } from "@/core/components/old/Component";

class Clickable implements Component {
    onClick: (() => void) | null;
    isEnabled: boolean = true;
    cursor: string = "pointer";
    isClicked: boolean = false;

    constructor({
        onClick = null,
        isEnabled = true,
        cursor = "pointer",
        isClicked = false
    }: Partial<Clickable>) {
        this.onClick = onClick;
        this.isEnabled = isEnabled;
        this.cursor = cursor;
        this.isClicked = isClicked;
    }
}

export { Clickable };
