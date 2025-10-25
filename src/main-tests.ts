import { ECS } from 'core/ECS';
import { SparseSet } from '@/core/utils/SparseSet';

/**
 * TESTS ECS
 */
console.group('ECS');
const ecs = new ECS();

const entity = ecs.createEntity();
ecs.hasEntity(entity)
console.log('entity', entity );
console.groupEnd();
/**
 * TEST ENTITY SPARSESET
 */
/* const entitySparseSet = new EntitySparseSet(100);
const entity1 = entitySparseSet.createEntity();
const entity2 = entitySparseSet.createEntity();
console.group('EntitySparseSet');
console.log('entity1', entity1);
console.log('entity2', entity2);

entitySparseSet.deleteEntity(entity1);
const entity3 = entitySparseSet.createEntity();
console.log('entity3', entity3);
console.log(entitySparseSet.getStats());

console.groupEnd(); */

/**
 * TEST SPARSESET
 */
// const maxentity = 100;
// const sparseSet = new SparseSet(maxentity);
// const entityId = 1
// const id1 = sparseSet.addItem(entityId, 100);
// const id2 = sparseSet.addItem(2, 200);
// sparseSet.removeItem(entityId);
// const id3 = sparseSet.addItem(3, 300);

// Verify that the ID of the deleted item is reused
// console.log('id1', id1, 'id3', id3);
const sparseSet = new SparseSet(100);
const entity1 = 1;
const entity2 = 2;
const entity3 = 3;
const id1 = sparseSet.addItem(entity1, 100);
sparseSet.addItem(entity2, 200);
sparseSet.removeItem(entity1);
const id3 = sparseSet.addItem(entity3, 300);

// Verify that the ID of the deleted item is reused
console.log(`id3: ${id3} should be equal to id1: ${id1}`);

// Verify the values
console.log('sparseSet.getItem(entity2):', sparseSet.getItem(entity2), 'should be 200');
console.log('sparseSet.getItem(entity3):', sparseSet.getItem(entity3), 'should be 300');
console.log(sparseSet.getStats());

/**
 * PERF SPARSESET
 */
/* const  maxElements = 100000;
console.time('empty loop');
console.timeEnd('empty loop');
console.time('empty iteration');
for (let i = 0; i < maxElements; i++) {
    const elem = i
}
console.timeEnd('empty iteration');
const sparseSet = new SparseSet(maxElements);
console.time('sparseSet 100000 element creation destruction');
console.time('sparseSet creation');
for (let i = 0; i < maxElements; i++) {
    sparseSet.addItem(i, {x: i * 10, y: i * 20});
}
console.timeEnd('sparseSet creation');
// Verify the size

console.time('sparset destruction');
// Remove all elements
for (let i = 0; i < maxElements; i++) {
    sparseSet.removeItem(i);
}
console.timeEnd('sparset destruction');
console.timeEnd('sparseSet 100000 element creation destruction');
console.log(sparseSet.getStats());
// Verify the values
// expect(sparseSet.getItem(id3)).toBe(300);
// expect(sparseSet.getItem(id2)).toBe(200); */
