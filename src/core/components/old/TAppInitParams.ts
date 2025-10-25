import type { Dimension } from ".";

export type TAppInitParams = {
    dimension?: Dimension;
    addEventSystem?: boolean;
    addEventLogDebugger?: boolean;
    add2DCanvasSystem?: boolean;
    addMouseSystem?: boolean;
    addRenderSystem?: boolean;
}