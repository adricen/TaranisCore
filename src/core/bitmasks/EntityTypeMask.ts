export enum EntityTypeMask {
    None = 0,               // 0 - No components
    Mouse = 1 << 0,      // 1 - Marker component for mouse entity
    Canvas = 1 << 1,      // 2 - Marker component for canvas entity
}