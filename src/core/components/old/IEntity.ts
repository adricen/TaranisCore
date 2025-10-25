import type { IComponent } from "./Component";

export interface IEntity<T extends IComponent = IComponent> {
    id: string;
    components: Map<string, T>;
    tags?: Set<string>;
}
