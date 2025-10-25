import { describe, it, expect, beforeEach } from 'vitest';
import { ECS } from '@/core/ECS';
import { CoreMask } from 'core/bitmasks/CoreMask';
import { TransformMask } from 'core/bitmasks/TransformMask';

describe('ECS', () => {
    let ecs: ECS

    beforeEach(() => {
        ecs = new ECS();
    });

    it('Should create an entity with no component', () => {
        const entityId = ecs.createEntity();
        expect(ecs.hasEntity(entityId)).toBe(true);
    });

    it('Should add and retrieve a Position component', () => {
        const entityId = ecs.createEntity();
        const position = { x: 10, y: 20 };
        ecs.addComponent(entityId, 'Transform', TransformMask.Position, position); 

        const retrievedPosition = ecs.getComponent(entityId, 'Transform', TransformMask.Position);
        expect(retrievedPosition).toEqual(position);
    });

    it('Should add and retrieve a Visible component', () => {
        const entityId = ecs.createEntity();
        const visible = { visible: true };
        ecs.registerFamily('Core');
        ecs.addComponent(entityId, 'Core', CoreMask.Renderable, visible);
        const retrievedVisible = ecs.getComponent(entityId, 'Core', CoreMask.Renderable);
        expect(retrievedVisible).toEqual(visible);
    });

    it('Should delete an entity and its components', () => {
        const entityId = ecs.createEntity();
        const position = { x: 10, y: 20 };
        ecs.addComponent(entityId, 'Transform', TransformMask.Position, position);

        ecs.removeEntity(entityId);
        expect(ecs.hasEntity(entityId)).toBe(false);
        const retrievedPosition = ecs.getComponent(entityId, 'Transform', 1);
        expect(retrievedPosition).toBeUndefined();
    });

    it('Should remove all components when an entity is deleted', () => {
        const entityId = ecs.createEntity();
        const position = { x: 10, y: 20 };
        const visible = { visible: true };

        ecs.addComponent(entityId, 'Transform', TransformMask.Position, position); // 1 corresponds to TransformMask.Position
        ecs.addComponent(entityId, 'Core', CoreMask.Renderable, visible); // 1 corresponds to CoreMask.Renderable

        ecs.removeEntity(entityId);

        expect(ecs.getComponent(entityId, 'Transform', TransformMask.Position)).toBeUndefined();
        expect(ecs.getComponent(entityId, 'Core', CoreMask.Renderable)).toBeUndefined();
    });

    it('Should add multiple components to an entity', () => {
        const entityId = ecs.createEntity();
        const position = { x: 10, y: 20 };
        const rotation = { angle: 45 };

        ecs.addComponent(entityId, 'Transform', TransformMask.Position, position); // TransformMask.Position
        ecs.addComponent(entityId, 'Transform', TransformMask.Rotation, rotation); // TransformMask.Rotation

        const retrievedPosition = ecs.getComponent(entityId, 'Transform', 1);
        const retrievedRotation = ecs.getComponent(entityId, 'Transform', 2);

        expect(retrievedPosition).toEqual(position);
        expect(retrievedRotation).toEqual(rotation);
    });

    it('Should retrieve all entities with a specific component', () => {
        const entityId1 = ecs.createEntity();
        const entityId2 = ecs.createEntity();
        const position = { x: 10, y: 20 };

        ecs.addComponent(entityId1, 'Transform', TransformMask.Position, position); // TransformMask.Position
        ecs.addComponent(entityId2, 'Transform', TransformMask.Position, position); // TransformMask.Position

        const entities = ecs.getAllEntitiesWithComponent('Transform', TransformMask.Position);
        expect(entities).toHaveLength(2);
        expect(entities.map(e => e.itemId)).toContain(entityId1);
        expect(entities.map(e => e.itemId)).toContain(entityId2);
    });

    it('Should remove a specific component from an entity', () => {
        const entityId = ecs.createEntity();
        const position = { x: 10, y: 20 };
        const rotation = { angle: 45 };

        ecs.addComponent(entityId, 'Transform', TransformMask.Position, position); // TransformMask.Position
        ecs.addComponent(entityId, 'Transform', TransformMask.Rotation, rotation); // TransformMask.Rotation

        ecs.removeComponent(entityId, 'Transform', 1);

        expect(ecs.getComponent(entityId, 'Transform', TransformMask.Position)).toBeUndefined();
        expect(ecs.getComponent(entityId, 'Transform', TransformMask.Rotation)).toEqual(rotation);
    });

    it('Should handle operations on non-existing entities gracefully', () => {
        const nonExistentEntityId = 1500;

        expect(() => ecs.removeEntity(nonExistentEntityId)).not.toThrow();
        expect(() => ecs.removeComponent(nonExistentEntityId, 'Transform', TransformMask.Position)).not.toThrow();
        expect(ecs.getComponent(nonExistentEntityId, 'Transform', TransformMask.Position)).toBeUndefined();
    });

    it('Should register a family automatically when adding a component', () => {
        const entityId = ecs.createEntity();
        const position = { x: 10, y: 20 };

        ecs.addComponent(entityId, 'Transform', TransformMask.Position, position); // TransformMask.Position

        expect(ecs.getComponent(entityId, 'Transform', TransformMask.Position)).toEqual(position);
    });

    it('Should return correct ECS stats', () => {
        expect(ecs.getStats()).toEqual({ maxEntities: 1000, currentEntities: 0 });

        const entityId = ecs.createEntity();
        expect(ecs.getStats()).toEqual({ maxEntities: 1000, currentEntities: 1 });

        ecs.removeEntity(entityId);
        expect(ecs.getStats()).toEqual({ maxEntities: 1000, currentEntities: 0 });
    });

    it('Should throw an error when trying to retrieve a component from an unregistered family', () => {
        const entityId = ecs.createEntity();

        expect(() => {
            ecs.getComponent(entityId, 'UnregisteredFamily' as any, 1);
        }).toThrowError('Family UnregisteredFamily is not registered.');
    });

    it('Should throw an error when trying to remove a component from an unregistered family', () => {
        const entityId = ecs.createEntity();

        expect(() => {
            ecs.removeComponent(entityId, 'UnregisteredFamily' as any, 1);
        }).toThrowError('Family UnregisteredFamily is not registered.');
    });

    it('Should handle adding and removing components in rapid succession', () => {
        const entityId = ecs.createEntity();
        const position = { x: 10, y: 20 };

        ecs.addComponent(entityId, 'Transform', 1, position);
        expect(ecs.getComponent(entityId, 'Transform', TransformMask.Position)).toEqual(position);

        ecs.removeComponent(entityId, 'Transform', TransformMask.Position);
        expect(ecs.getComponent(entityId, 'Transform', TransformMask.Position)).toBeUndefined();

        ecs.addComponent(entityId, 'Transform', TransformMask.Position, position);
        expect(ecs.getComponent(entityId, 'Transform', TransformMask.Position)).toEqual(position);
    });

    it('Should allow multiple entities to share the same component data', () => {
        const entityId1 = ecs.createEntity();
        const entityId2 = ecs.createEntity();
        const position = { x: 10, y: 20 };

        ecs.addComponent(entityId1, 'Transform', TransformMask.Position, position);
        ecs.addComponent(entityId2, 'Transform', TransformMask.Position, position);

        expect(ecs.getComponent(entityId1, 'Transform', TransformMask.Position)).toEqual(position);
        expect(ecs.getComponent(entityId2, 'Transform', TransformMask.Position)).toEqual(position);
    });
});