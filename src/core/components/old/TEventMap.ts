import type { Dimension, MouseStateComponent, Position } from "commons/components";
import type { EventNamesEnum } from "core/EventSystem/typescript";

export type TEventMap = {
    [EventNamesEnum.CanvasResize]: Dimension;
    [EventNamesEnum.Click]: Position;
    [EventNamesEnum.CanvasLinked]: HTMLCanvasElement | Error;
    [EventNamesEnum.MouseDown]: MouseStateComponent;
    [EventNamesEnum.MouseUp]: MouseStateComponent;
    [EventNamesEnum.MouseMove]: Position;
}