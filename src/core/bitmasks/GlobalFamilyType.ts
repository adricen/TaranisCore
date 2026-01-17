import { CoreMask } from "core/bitmasks/CoreMask";
import { TypeMask } from "core/bitmasks/TypeMask";
import type { Position } from "components/core/Position";
import type { Rotation } from "components/core/Rotation";
import type { Scale } from "components/core/Scale";
import type { Visible } from "components/core/Visible";
import type { Quaternion } from "components/core/Quaternion";
import type { HtmlElementContainer } from "components/core/HtmlElementContainer";
import type { Tags } from "components/core/Tags";

/**
 * The ECS (Entity-Component-System) class is the core of the framework.
 * It manages entities, their masks, handle components and systems.
 * @note you need to extend this type to add your own components families and transfert it to ecs on construction like ECS<MyFamilies>
 * @example type MyFamilies = GlobalFamilyType | MyFamilyType;
 */
type GlobalFamilyType = {
  Core: {
    [CoreMask.None]: null; // Marker component if no component is attached to entity
    [CoreMask.Position]: Position;
    [CoreMask.Rotation]: Rotation;
    [CoreMask.Quaternion]: Quaternion;
    [CoreMask.Scale]: Scale;
    [CoreMask.Renderable]: Visible;
    [CoreMask.HtmlElement]: HtmlElementContainer;
    [CoreMask.Visible]: Visible;
    [CoreMask.Name]: string;
    [CoreMask.Tags]: Tags;
    [CoreMask.width]: number;
    [CoreMask.height]: number;
    [CoreMask.id]: string;
    [CoreMask.isDirty]: boolean;
    [CoreMask.isActive]: boolean;
    [CoreMask.isDebug]: boolean;
    [CoreMask.isHovered]: boolean;
    [CoreMask.isClicked]: boolean;
  };
  Type: {
    [TypeMask.None]: null;
    [TypeMask.Mouse]: null;
    [TypeMask.Canvas]: null;
  };
  // Can had some more type family mask for futur needs
  // Physic: {
  //     [PhysiqueMask.PhysicsBody]: PhysicsBody;,
  // };
};

export type { GlobalFamilyType };
