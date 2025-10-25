import { TransformMask } from "core/components/BitMasks/TransformMask";
import { CoreMask } from "core/components/BitMasks/CoreMask";
import type { Position } from "core/components/Position";
import type { Rotation } from "core/components/Rotation";
import type { Scale } from "core/components/Scale";
import type { Visible } from "core/components/Visible";
import type { HtmlElementContainer } from "../components/HtmlElementContainer";

/**
 * The ECS (Entity-Component-System) class is the core of the framework.
 * It manages entities, their masks, handle components and systems.
 * @note you need to extend this type to add your own components families and transfert it to ecs on construction like ECS<MyFamilies>
 * @example type MyFamilies = GlobalFamilyType | MyFamilyType;
 */
type GlobalFamilyType = {
    Transform: {
        [TransformMask.Position]: Position;
        [TransformMask.Rotation]: Rotation;
        [TransformMask.Scale]: Scale;
    };
    Core: {
        [CoreMask.Renderable]: Visible;
        [CoreMask.HtmlElement]: HtmlElementContainer;
    };
};

export type { GlobalFamilyType };