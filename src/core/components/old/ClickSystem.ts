import { Clickable, Position } from "commons/components";
import type { ECS } from "@/core/ECS-old";
import type { ISystem } from "commons/typescript";

// TODO: test this file
class ClickSystem implements ISystem {
    protected ecs: ECS;
    // TODO: Click event
    constructor(ecs: ECS ) {
        this.ecs = ecs;
    }


    // useless for now
    update() {
        const mouseEntities = this.ecs.getEntitiesWithTags(['mouse']);
        if (mouseEntities.length === 0) return;

        const mouseEntity = mouseEntities[0];
        const mousePosition = mouseEntity.components.get(Position.prototype.constructor.name);
        if (!mousePosition) return;
        
        const clickableEntities = this.ecs.getEntitiesWithComponents([Clickable]);
    }

    dispose() {}
}

export { ClickSystem };