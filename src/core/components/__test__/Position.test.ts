// tests/core/components/Position.test.ts
import { describe, it, expect } from 'vitest';
// import { Position } from 'commons/components/Position';

describe.skip('Position Component', () => {
  it('should initialize with default values', () => {
    const position = new Position();
    expect(position.x).toBe(0);
    expect(position.y).toBe(0);
  });

  it('should initialize with custom values', () => {
    const position = new Position({x: 2, y: 3});
    expect(position.x).toBe(2);
    expect(position.y).toBe(3);
  });

  it('should allow modification of x and y', () => {
    const position = new Position({x: 1, y: 1});
    position.x = 5;
    position.y = 10;
    expect(position.x).toBe(5);
    expect(position.y).toBe(10);
  });
});
