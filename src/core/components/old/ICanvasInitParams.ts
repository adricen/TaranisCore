import type { Canvas } from "canvas";

export interface ICanvasInitParams {
  canvas: string | HTMLCanvasElement | Canvas;
  width?: number;
  height?: number;
  styleCtx?: {
    [key: string]: string | number;
  };
}