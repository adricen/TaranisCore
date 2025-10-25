import type { IComponent } from "@/core/components/old/Component";

export interface Position extends IComponent {
    x: number;
    y: number;
    z?: number;
}