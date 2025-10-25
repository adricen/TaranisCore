export enum TransformMask {
    Position = 1 << 0, // 1 - 0x00000000000000000000000000000001
    Rotation = 1 << 1, // 2 - 0x00000000000000000000000000000010
    Scale = 1 << 2,    // 4 - 0x00000000000000000000000000000100
}

// let monMask = 0x00000000000000000000000000000000;
// monMask |= TransformMask.Position | TransformMask.Rotation; // Add Position component
// console.log(monMask.toString(2).padStart(32, '0')); // Affiche le masque en binaire - 0x00000000000000000000000000000011
// monMask &= ~TransformMask.Position; // Remove Position component - 0x00000000000000000000000000000010
// if (monMask & TransformMask.Position | TransformMask.Rotation) { } // Check for Position component