import type { TEventMap } from "@/core/EventSystem/typescript/TEventMap";

export interface IEvent<K extends keyof TEventMap = keyof TEventMap> {
    name: K;
    args: TEventMap[K];
    order?: number; // Optional priority property
}