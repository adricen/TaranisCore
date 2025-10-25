import { EntityTypeMask } from "@/core/utils/EntityTypeMask";

// TODO: Test and validate this class
/**
 * SparseSet specialized for entity management with bitmask support 
 * Each entity is represented by an ID (number) and can have multiple masks (bitflags)
 * This allows efficient querying of entities based on their masks
 * The SparseSet architecture allow an efficient memory management
 * and fast access to entities
 */
class EntitySparseSet<
    E extends EntityTypeMask = EntityTypeMask,
> {
    /**
     * sparse is an array where the index represents the entity ID
     */
    protected sparse: Int32Array;
    /**
     * keys is the dense array that holds the actual entity IDs
     */
    protected keys: number[];
    /**
     * freeList keeps track of available IDs for reuse
     */
    protected freeList: number[];
    /**
     * bitSet is an array where each index corresponds to an entity ID and holds its mask (bitflags)
    */
    protected bitSet: E[]; 
    // create a new entity ID when necessary
    protected nextItemId: number = 0;
    // total number of items in the sparse set
    protected activeCount: number = 0;

    constructor(maxEntities: number = 10000) {
        this.sparse = new Int32Array(maxEntities).fill(-1);
        this.keys = new Array(maxEntities).fill(-1);
        this.freeList = [];
        this.bitSet = new Array<E>(maxEntities).fill(EntityTypeMask.None as E); // Initialisation des masks à 0
    }
    // #region ENTITIES
    /**
     * Creates a new entity with a unique ID.
     * Reuses IDs from the free list if available, otherwise generates a new one.
     * Throws an error if the SparseSet is full.
     * @returns { number } new entityId
     */
    createEntity(mask?: E): number {
        if (this.isFull) {
            throw new Error("Cannot create more entities: SparseSet is full.");
        }

        // Use an ID from the free list or generate a new one
        const entityId = this.freeList.length > 0 ? this.freeList.pop()! : this.nextItemId++;

        // Ajoute l'entité dans le tableau dense
        const denseIndex = this.activeCount;

        // Met à jour les structures internes
        this.sparse[entityId] = denseIndex;
        this.keys[denseIndex] = entityId;

        // Initialise le mask de l'entité
        this.bitSet[entityId] = mask ?? EntityTypeMask.None as E;

        this.activeCount++;
        return entityId;
    }

    /**
     * Returns a list of all active entity IDs.
     * @returns {number[]} An array of active entity IDs.
     */
    getAllEntities(): number[] {
        return this.keys.filter(key => key !== -1);
    }

    /**
     * Deletes an entity by its ID.
     * The ID is added back to the free list for reuse.
     * @param entityId - The ID of the entity to delete.
     * @throws {Error} If the entity does not exist.
     */
    deleteEntity(entityId: number): void {
        if (entityId < 0 || entityId >= this.sparse.length || this.sparse[entityId] === -1) {
            throw new Error(`Entity ${entityId} does not exist.`);
        }

        const denseIndex = this.sparse[entityId];

        // Supprime l'entité des structures internes
        this.sparse[entityId] = -1;
        this.bitSet[entityId] = EntityTypeMask.None as E; // Réinitialise le mask
        this.keys[denseIndex] = -1;

        // Ajoute l'indice dense à la freeList pour réutilisation
        this.freeList.push(entityId);
        this.activeCount--;
    }

    /**
     * Checks if an entity exists in the SparseSet.
     * @param entityId - The ID of the entity to check.
     * @returns {boolean} True if the entity exists, false otherwise.
     */
    hasEntity(entityId: number): boolean {
        return entityId >= 0 && entityId < this.sparse.length && this.sparse[entityId] !== -1;
    }
    // #endregion
    // #region MASKS

    /**
     * Add a mask to an entity's existing masks.
     * @param entityId 
     * @param mask 
     */
    addMaskToEntity(entityId: number, mask: E): void {
        if (!this.hasEntity(entityId)) {
            throw new Error(`Entity ${entityId} does not exist.`);
        }
        this.bitSet[entityId] = (this.bitSet[entityId] | mask) as E;
    }
    
    updateMask(entityId: number, mask: E): void {
        if (!this.hasEntity(entityId)) {
            throw new Error(`Entity ${entityId} does not exist.`);
        }
        this.bitSet[entityId] = mask;
    }

    /**
     * Return the type Mask of an entity
     * Useffull to get to be sure of an entity type
     * @param entityId 
     * @returns 
     */
    getMask(entityId: number): E {
        return this.bitSet[entityId];
    }

    /**
     * get all entity that match the given mask.
     * @param mask - The mask to filter entities by - can be combineed mask
     * @returns 
     */
    getAllByMask(mask: E): number[] {
        const result: number[] = [];
        for (let i = 0; i < this.bitSet.length; i++) {
            if ((this.bitSet[i] & mask) !== 0) {
                result.push(i);
            }
        }
        return result;
    }

    /**
     * Get the first element that match the given mask.
     * @param mask 
     * @returns 
     */
    getFirstByMaks(mask: E): number | null {
        for (let i = 0; i < this.bitSet.length; i++) {
            if ((this.bitSet[i] & mask) !== 0) {
                return i;
            }
        }
        return null;
    }


    /**
     * Remove a mask from an entity's existing masks.
     * @param entityId 
     * @param mask 
     */
    removeMaskFromEntity(entityId: number, mask: E): void {
        if (!this.hasEntity(entityId)) {
            throw new Error(`Entity ${entityId} does not exist.`);
        }
        this.bitSet[entityId] = (this.bitSet[entityId] & ~mask) as E;
    }
    // #endregion
    // #region UTILS
    
    /**
     * Compacts the SparseSet by removing gaps left by deleted entities.
     * This operation is optional and can be used to optimize memory usage.
     * Note: Compacting changes the dense indices of entities, so use with caution.
     * @deprecated probably not needed and bug prone
     */
    compact(): void {
        const newBitSet: number[] = [];
        const newFreeList: number[] = [];

        for (let i = 0; i < this.bitSet.length; i++) {
            if (this.bitSet[i] !== EntityTypeMask.None) {
                newBitSet.push(this.bitSet[i]);
            } else {
                newFreeList.push(i);
            }
        }

        this.bitSet = newBitSet as E[];
        this.freeList = newFreeList;
    }

    clear(): void {
        this.sparse.fill(-1);
        this.keys.fill(-1);
        this.freeList = [];
        this.nextItemId = 0;
    }

    /**
     * Returns the maximum capacity of the SparseSet.
     * @returns {number} The maximum number of entities the SparseSet can hold.
     */
    capacity(): number {
        return this.sparse.length;
    }

    /**
     * Indicates whether the SparseSet has reached its maximum capacity.
     */
    get isFull(): boolean {
        return this.nextItemId >= this.sparse.length && this.freeList.length === 0;
    }

    getStats() {
        const sparseListLenght = this.sparse.filter(key => key !== -1).length;
        return {
            capacity: this.capacity(),
            size: this.activeCount,
            used: sparseListLenght,
            sparseList: this.sparse,
            freeListLenght: this.freeList.length,
            freeList: this.freeList,
        };
    }
    // #endregion
}

export { EntitySparseSet };
