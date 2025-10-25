import { describe, it, expect, beforeEach } from 'vitest';
import { SparseSet } from 'core/utils/SparseSet';

describe('SparseSet', () => {
    let sparseSet: SparseSet<number>;
    beforeEach(() => {
        const maxentity = 1000;
        sparseSet = new SparseSet(maxentity);
        // Any setup needed before each test
    });
    it('should initialize SparseSet with max size', () => {
        const maxentity = 500;
        const localSparseSet = new SparseSet(maxentity);
        const stats = localSparseSet.getStats();
        expect(stats.dense.length).toBe(maxentity);
    });

    it ('should throw error for invalid ID', () => {
        const invalidId = -1;
        expect(() => sparseSet.addItem(invalidId, 10)).toThrowError(`Invalid ID: ${invalidId}. Must be between 0 and ${sparseSet.getStats().dense.length - 1}.`);
    });

    it('should create an empty SparseSet', () => {
        const stats = sparseSet.getStats();
        expect(stats.free.length).toBe(0);
        expect(stats.denseLength).toBe(0);
    });

    it('should not create a new item the Id already exist', () => {
        const entityId = 42;
        const value = 99;
        sparseSet.addItem(entityId, value);
        expect(() => sparseSet.addItem(entityId, value)).toThrowError(`Entity ID ${entityId} already exists.`);
    })

    it('should add and retrieve values', () => {
        const entityId = 42;
        const value = 99;
        sparseSet.addItem(entityId, value);
        const stats = sparseSet.getStats();
        expect(stats.free.length).toBe(0);
        expect(stats.denseLength).toBe(1);
        expect(sparseSet.getItem(entityId)).toBe(value);
    });

    it('should return unedfined for missing keys', () => {
        expect(sparseSet.getItem(300)).toBeUndefined();
    });

    it('should delete values', () => {
        const entityId = 2;
        sparseSet.addItem(entityId, 200);
        sparseSet.removeItem(entityId);
        expect(sparseSet.getItem(entityId)).toBeUndefined();
    });

    it('should update values', () => {
        const entityId = 3;
        sparseSet.addItem(entityId, 300);
        sparseSet.updateItem(entityId, 400);
        expect(sparseSet.getItem(entityId)).toBe(400);
    });

    it('should report correct size', () => {
        sparseSet.addItem(1, 10);
        sparseSet.addItem(2, 20);
        sparseSet.addItem(3, 30);
        expect(sparseSet.size).toBe(3);
        sparseSet.removeItem(2);
        expect(sparseSet.size).toBe(2);
    });
    it('should reuse IDs after deletion', () => {
        const id1 = sparseSet.addItem(1, 100);
        sparseSet.addItem(2, 200);
        sparseSet.removeItem(1);
        const id3 = sparseSet.addItem(3, 300);

        // Verify that the ID of the deleted item is reused
        expect(id3).toBe(id1);

        // Verify the values
        expect(sparseSet.getItem(3)).toBe(300);
        expect(sparseSet.getItem(2)).toBe(200);
    });

    it('should handle a large number of elements efficiently', () => {
        const maxElements = 100000;
        sparseSet = new SparseSet(maxElements);
        for (let i = 0; i < maxElements; i++) {
            sparseSet.addItem(i, i * 10);
        }

        // Verify the size
        expect(sparseSet.size).toBe(maxElements);

        // Verify retrieval of some elements
        for (let i = 0; i < 100; i++) {
            expect(sparseSet.getItem(i)).toBe(i * 10);
        }

        // Remove all elements
        for (let i = 0; i < maxElements; i++) {
            sparseSet.removeItem(i);
        }

        // Verify the size after removal
        expect(sparseSet.size).toBe(0);
    });

    it('should handle adding up to maximum capacity', () => {
        const maxCapacity = sparseSet.getStats().dense.length;
        for (let i = 0; i < maxCapacity; i++) {
            sparseSet.addItem(i, i * 10);
        }

        // Verify the size
        expect(sparseSet.size).toBe(maxCapacity);

        // Verify that adding beyond capacity throws an error
        expect(() => sparseSet.addItem(maxCapacity, 999)).toThrowError(`Invalid ID: ${maxCapacity}. Must be between 0 and ${sparseSet.getStats().dense.length - 1}.`);
    });

    it('should handle removing all elements', () => {
        const maxCapacity = sparseSet.getStats().dense.length;
        for (let i = 0; i < maxCapacity; i++) {
            sparseSet.addItem(i, i * 10);
        }

        for (let i = 0; i < maxCapacity; i++) {
            sparseSet.removeItem(i);
        }

        // Verify the size after removal
        expect(sparseSet.size).toBe(0);

        // Verify that all elements are removed
        for (let i = 0; i < maxCapacity; i++) {
            expect(sparseSet.getItem(i)).toBeUndefined();
        }
    });

    it('should maintain internal structure integrity after multiple operations', () => {
        const operations = 100;

        // Add elements
        for (let i = 0; i < operations; i++) {
            sparseSet.addItem(i, i * 10);
        }

        // Remove some elements
        for (let i = 0; i < operations; i += 2) {
            sparseSet.removeItem(i);
        }

        // Verify remaining elements
        for (let i = 1; i < operations; i += 2) {
            expect(sparseSet.getItem(i)).toBe(i * 10);
        }

        // Verify removed elements
        for (let i = 0; i < operations; i += 2) {
            expect(sparseSet.getItem(i)).toBeUndefined();
        }

        // Verify size
        expect(sparseSet.size).toBe(operations / 2);
    });

    it('should update and reuse freeList correctly', () => {
        // Add initial items
        sparseSet.addItem(1, 100);
        sparseSet.addItem(2, 200);
        sparseSet.addItem(3, 300);

        // Remove an item
        sparseSet.removeItem(2);

        // Verify that the freeList contains the removed index
        const statsAfterRemoval = sparseSet.getStats();
        expect(statsAfterRemoval.free.length).toBe(1);
        expect(statsAfterRemoval.free[0]).toBe(1);

        // Add a new item and verify it reuses the free index
        sparseSet.addItem(4, 400);
        const statsAfterAddition = sparseSet.getStats();
        expect(statsAfterAddition.free.length).toBe(0); // Free list should be empty
        expect(sparseSet.getItem(4)).toBe(400);
    });
});