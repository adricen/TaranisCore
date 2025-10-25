// tests/core/systems/RenderSystem.test.ts
import { describe, it, expect } from 'vitest';
// import { RenderSystem } from 'core/systems';
// import { CanvasManager } from '@/core/managers/CanvasManager';

describe.skip('RenderSystem (Base)', () => {
    it('should be abstract and not instantiable directly', () => {
        // Vérifie que RenderSystem est bien abstraite (ne peut pas être instanciée directement)
        expect(() => {
            new (RenderSystem as any)({} as CanvasManager);
        }).toThrow();
    });
});
