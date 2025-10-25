import { describe, it, expect, beforeEach } from 'vitest';
import { EntitySparseSet } from 'core/utils/EntitySparseSet';

describe('EntitySparseSet', () => {
    let entitySparseSet: EntitySparseSet;
    beforeEach(() => {
        const maxentity = 100;
        entitySparseSet = new EntitySparseSet(maxentity);
        // Any setup needed before each test
    });
    it('should initialize EntitySparseSet with max size', () => {
        const maxentity = 50;
        const localEntitySparseSet = new EntitySparseSet(maxentity);
        const stats = localEntitySparseSet.getStats();
        expect(stats.capacity).toBe(maxentity);
    });

    it('should create an empty EntitySparseSet', () => {
        const stats = entitySparseSet.getStats();
        expect(stats.size).toBe(0);
        expect(stats.used).toBe(0);
    });

    it('should should create an entity and add it to the sparse set', () => {
        const newEntity = entitySparseSet.createEntity();
        expect(newEntity).toBe(0);
        const stats = entitySparseSet.getStats();
        expect(stats.size).toBe(1);
        expect(stats.used).toBe(1);
    });
    it('should create multiple entities and track them correctly', () => {
        const entity1 = entitySparseSet.createEntity();
        const entity2 = entitySparseSet.createEntity();
        const entity3 = entitySparseSet.createEntity();
        expect(entity1).toBe(0);
        expect(entity2).toBe(1);
        expect(entity3).toBe(2);
        const stats = entitySparseSet.getStats();
        expect(stats.size).toBe(3);
        expect(stats.used).toBe(3);
    });

    it('should return false when looking for an unknown entity', () => {
        expect(entitySparseSet.hasEntity(999)).toBe(false);
    });

    it('should return true when looking for an existing entity', () => {
        const entity = entitySparseSet.createEntity();
        expect(entitySparseSet.hasEntity(entity)).toBe(true);
    });

    it('should delete an entity and update the sparse set accordingly', () => {
        entitySparseSet.createEntity();
        const entity2 = entitySparseSet.createEntity();
        entitySparseSet.createEntity();
        expect(entitySparseSet.getStats().size).toBe(3);

        entitySparseSet.deleteEntity(entity2);
        const statsAfterDelete = entitySparseSet.getStats();
        expect(statsAfterDelete.size).toBe(2);
        expect(statsAfterDelete.used).toBe(2);
        expect(entitySparseSet.hasEntity(entity2)).toBe(false);
    });

    it('should create a new entity and assign a unique ID', () => {
        const entityId = entitySparseSet.createEntity();
        expect(entityId).toBe(0);
        expect(entitySparseSet.getStats().size).toBe(1);
    });

    it('should reuse IDs from the free list when entities are deleted', () => {
        const entity1 = entitySparseSet.createEntity();
        entitySparseSet.createEntity();
        entitySparseSet.deleteEntity(entity1);
        const entity3 = entitySparseSet.createEntity();
        expect(entity3).toBe(entity1); // Reuses the ID from the free list
    });

    it('should throw an error when trying to delete a non-existent entity', () => {
        expect(() => entitySparseSet.deleteEntity(5)).toThrowError('Entity 5 does not exist.');
    });

    it('should correctly update size when entities are added and removed', () => {
        const entity1 = entitySparseSet.createEntity();
        entitySparseSet.createEntity();
        expect(entitySparseSet.getStats().size).toBe(2);
        entitySparseSet.deleteEntity(entity1);
        expect(entitySparseSet.getStats().size).toBe(1);
    });

    it('should throw an error when trying to create more entities than the maximum allowed', () => {
        entitySparseSet = new EntitySparseSet(10);
        for (let i = 0; i < 10; i++) {
            entitySparseSet.createEntity();
        }
        expect(() => entitySparseSet.createEntity()).toThrowError('Cannot create more entities: SparseSet is full.');
    });

    it('should correctly handle bitmask updates for entities', () => {
        const entityId = entitySparseSet.createEntity();
        entitySparseSet.updateMask(entityId, 0b0010);
        expect(entitySparseSet.getMask(entityId)).toBe(0b0010);
        entitySparseSet.updateMask(entityId, 0b0100);
        expect(entitySparseSet.getMask(entityId)).toBe(0b0100);
    });

    it('should return all entities matching a specific mask', () => {
        const entity1 = entitySparseSet.createEntity(0b0010);
        entitySparseSet.createEntity(0b0100);
        const entity3 = entitySparseSet.createEntity(0b0010);

        const matchingEntities = entitySparseSet.getAllByMask(0b0010);
        expect(matchingEntities).toEqual([entity1, entity3]);
    });

    it('should correctly reset an entity when deleted', () => {
        const entityId = entitySparseSet.createEntity();
        entitySparseSet.updateMask(entityId, 0b0010);
        entitySparseSet.deleteEntity(entityId);

        expect(entitySparseSet.getMask(entityId)).toBe(0); // Mask should be reset
        expect(() => entitySparseSet.deleteEntity(entityId)).toThrowError(`Entity ${entityId} does not exist.`);
    });

    it('should correctly update dense indices after entity deletion', () => {
        const entity1 = entitySparseSet.createEntity();
        const entity2 = entitySparseSet.createEntity();
        const entity3 = entitySparseSet.createEntity();

        entitySparseSet.deleteEntity(entity2);

        // Verify that the deleted entity no longer exists
        expect(entitySparseSet.hasEntity(entity2)).toBe(false);

        // Verify that the size is updated correctly
        const stats = entitySparseSet.getStats();
        expect(stats.size).toBe(2);
        expect(stats.used).toBe(2);

        // Verify that the remaining entities still exist
        expect(entitySparseSet.hasEntity(entity1)).toBe(true);
        expect(entitySparseSet.hasEntity(entity3)).toBe(true);
    });

    it('should handle alternating addition and deletion of entities', () => {
        const entity1 = entitySparseSet.createEntity();
        const entity2 = entitySparseSet.createEntity();
        entitySparseSet.deleteEntity(entity1);
        const entity3 = entitySparseSet.createEntity();
        entitySparseSet.createEntity();
        entitySparseSet.deleteEntity(entity2);
        const entity5 = entitySparseSet.createEntity();

        // Verify that IDs are reused correctly
        expect(entity3).toBe(entity1); // Reused ID
        expect(entity5).toBe(entity2); // Reused ID

        // Verify the size and used count
        const stats = entitySparseSet.getStats();
        expect(stats.size).toBe(3);
        expect(stats.used).toBe(3);
    });

    it('should handle a large number of entities efficiently', () => {
        const maxEntities = 100000;
        entitySparseSet = new EntitySparseSet(maxEntities);

        for (let i = 0; i < maxEntities; i++) {
            entitySparseSet.createEntity();
        }

        const stats = entitySparseSet.getStats();
        expect(stats.size).toBe(maxEntities);
        expect(stats.used).toBe(maxEntities);

        for (let i = 0; i < maxEntities; i++) {
            entitySparseSet.deleteEntity(i);
        }

        const statsAfterDeletion = entitySparseSet.getStats();
        expect(statsAfterDeletion.size).toBe(0);
        expect(statsAfterDeletion.used).toBe(0);
    });
});