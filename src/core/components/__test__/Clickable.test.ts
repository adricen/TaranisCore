// tests/core/components/Clickable.test.ts
import { describe, it, expect, vi } from 'vitest';
// import { Clickable } from 'commons/components/Clickable';

describe.skip('Clickable Component', () => {
    it('should initialize with a callback', () => {
        const mockCallback = vi.fn();
        const clickable = new Clickable({ onClick: mockCallback });
        expect(clickable.onClick).toBe(mockCallback);
        expect(clickable.isEnabled).toBe(true);
        expect(clickable.cursor).toBe('pointer');
    });

    it('should allow disabling clicks', () => {
        const clickable = new Clickable({ onClick: () => {} });
        clickable.isEnabled = false;
        expect(clickable.isEnabled).toBe(false);
    });

    it('should allow custom cursor', () => {
        const clickable = new Clickable({onClick: () => {}, isEnabled: true, cursor: 'not-allowed'});
        expect(clickable.cursor).toBe('not-allowed');
    });
});
