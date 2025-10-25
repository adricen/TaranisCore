// tests/core/components/Renderable.test.ts
import { describe, it, expect } from 'vitest';
// import { Renderable } from 'commons/components/Renderable';

describe.skip('Renderable Component', () => {
    it('should initialize with default values', () => {
        const renderable = new Renderable();
        expect(renderable.symbol).toBe('');
        expect(renderable.color).toBe('#fff');
    });

    it('should initialize with custom values', () => {
        const renderable = new Renderable({symbol: 'X', color: '#FF0000', size: 48});
        expect(renderable.symbol).toBe('X');
        expect(renderable.color).toBe('#FF0000');
    });
});
