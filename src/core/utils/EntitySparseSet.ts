import { EntityTypeMask } from "@/core/utils/EntityTypeMask";
import type { GlobalFamilyType } from "core/bitmasks/GlobalFamilyType";
import { CoreMask } from "../bitmasks/CoreMask";

// TODO: Test and validate this class
/**
 * SparseSet specialized for entity management with bitmask support 
 * Each entity is represented by an ID (number) and can have multiple masks (bitflags)
 * This allows efficient querying of entities based on their masks
 * The SparseSet architecture allow an efficient memory management
 * and fast access to entities
 */
class EntitySparseSet<
    E extends GlobalFamilyType = GlobalFamilyType, // change this with 
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
     * bitSet is an arry of object that allow to store each entitys bitset mask
    */
    protected bitSet: Array<Record<keyof E, number >>
    // create a new entity ID when necessary
    protected nextItemId: number = 0;
    // total number of items in the sparse set
    protected activeCount: number = 0;

    constructor(maxEntities: number = 10000) {
        this.sparse = new Int32Array(maxEntities).fill(-1);
        this.keys = new Array(maxEntities).fill(-1);
        this.freeList = [];
        this.bitSet = new Array(maxEntities);
        for (let i = 0; i < maxEntities; i++) {
            this.bitSet[i] = {
                Core: CoreMask.None,
                Type: EntityTypeMask.None,
            } as Record<keyof E, number >;
        }
    }
    // #region ENTITIES
    /**
     * Creates a new entity with a unique ID.
     * Reuses IDs from the free list if available, otherwise generates a new one.
     * Throws an error if the SparseSet is full.
     * @returns { number } new entityId
     */
    createEntity(): number {
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

        this.activeCount++;
        return entityId;
    }

    /**
     * Creates multiple entities at once - more efficient than individual calls
     */
    createEntities(count: number): number[] {
        const entities: number[] = [];
        for (let i = 0; i < count; i++) {
            entities.push(this.createEntity());
        }
        return entities;
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
        const lastDenseIndex = this.activeCount - 1;
        
        // Swap if not deleting the last entity
        if (denseIndex !== lastDenseIndex) {
            const lastEntityId = this.keys[lastDenseIndex];
            this.keys[denseIndex] = lastEntityId;
            this.sparse[lastEntityId] = denseIndex;
        }

        // Supprime l'entité des structures internes
        this.sparse[entityId] = -1;
        for(let key in this.bitSet[entityId]) {
            this.bitSet[entityId][key] = 0; // reset all masks to none
        }

        // Ajoute l'indice dense à la freeList pour réutilisation
        this.freeList.push(entityId);
        this.activeCount--;
    }

    /**
     * Deletes multiple entities at once
     */
    deleteEntities(entityIds: number[]): void {
        // Sort by dense index descending to avoid index shifting issues
        const validIds = entityIds.filter(id => this.entityExist(id));
        validIds.sort((a, b) => this.sparse[b] - this.sparse[a]);
        
        for (const entityId of validIds) {
            this.deleteEntity(entityId);
        }
    }

    /**
     * Returns a list of all active entity IDs.
     * @returns {number[]} An array of active entity IDs.
     */
    getAllEntities(): number[] {
        return this.keys.slice(0, this.activeCount);
    }

    

    /**
     * Checks if an entity exists in the SparseSet.
     * @param entityId - The ID of the entity to check.
     * @returns {boolean} True if the entity exists, false otherwise.
     */
    entityExist(entityId: number): boolean {
        return entityId >= 0 && entityId < this.sparse.length && this.sparse[entityId] !== -1;
    }
    // #endregion
    // #region MASKS

    /**
     * Add a mask to an entity's existing masks.
     * @param entityId 
     * @param mask 
     */
    addMaskToEntity(entityId: number, mask: Partial<Record<keyof E, number>>): void {
        if (!this.entityExist(entityId)) {
            throw new Error(`Entity ${entityId} does not exist.`);
        }
        for(let key in mask) {
            if (mask[key] !== undefined) {
                this.bitSet[entityId][key] |= mask[key];
            }
        }
    }
    // #endregion

    // #region QUERYING
    /**
     * Return the type Mask of an entity
     * Useffull to get to be sure of an entity type
     * @param entityId 
     * @returns 
     */
    getMask(entityId: number): Record<keyof E, number> {
        if (!this.entityExist(entityId)) {
            throw new Error(`Entity ${entityId} does not exist.`);
        }
        return this.bitSet[entityId];
    }

    /**
     * get all entity that match the given mask.
     * @param mask - The mask to filter entities by - can be combineed mask
     * @returns 
     */
    /**
     * Get all entities that match ALL specified masks (AND operation).
     * Most efficient querying - only checks active entities.
     * @param masks - Object specifying which masks to match
     * @returns Array of entity IDs that match ALL specified masks
     */
    getAllByMask(masks: Partial<Record<keyof E, number>>, maxResults?: number): number[] {
        const result: number[] = [];
        const keysToCheck = (Object.keys(masks) as Array<keyof E>).filter(key => masks[key] !== undefined);
        
        if (keysToCheck.length === 0) {
            return this.getAllEntities(); // No masks = all entities
        }
        
        for (let i = 0; i < this.activeCount; i++) {
            const entityId = this.keys[i];
            const entityMasks = this.bitSet[entityId];
            
            let matches = true;
            for (const key of keysToCheck) {
                if ((entityMasks[key] & masks[key]!) !== masks[key]!) {
                    matches = false;
                    break;
                }
            }
            
            if (matches) {
                result.push(entityId);
                if (maxResults && result.length >= maxResults) {
                    break; // Early termination
                }
            }
        }
        
        return result;
    }

    /**
     * Get the first element that match the given mask.
     * @param mask 
     * @returns 
     */
    getFirstByMask(masks: Partial<Record<keyof E, number>>): number | null {
        for (let i = 0; i < this.activeCount; i++) {
            const entityId = this.keys[i];
            const entityMasks = this.bitSet[entityId];
            
            let matches = true;
            for (const key in masks) {
                if (masks[key] !== undefined && (entityMasks[key] & masks[key]) !== masks[key]) {
                    matches = false;
                    break;
                }
            }
            
            if (matches) {
                return entityId;
            }
        }
        return null;
    }


    /**
     * Remove a mask from an entity's existing masks.
     * @param entityId 
     * @param mask 
     */
    removeMaskFromEntity(entityId: number, masks: Partial<Record<keyof E, number>>): void {
        if (!this.entityExist(entityId)) {
            throw new Error(`Entity ${entityId} does not exist.`);
        }
        
        for (const key in masks) {
            if (masks[key] !== undefined) {
                this.bitSet[entityId][key] &= ~masks[key]; // Remove specific bits
            }
        }
    }
    // #endregion
    // #region UTILS & DEBUGGING
    
    clear(): void {
        this.sparse.fill(-1);
        this.keys.fill(-1);
        this.freeList = [];
        this.nextItemId = 0;
        this.activeCount = 0; // ← Missing!
        
        // Optional: Reset bitsets too
        for (let i = 0; i < this.bitSet.length; i++) {
            this.bitSet[i] = {
                Core: CoreMask.None,
                Type: EntityTypeMask.None,
            } as Record<keyof E, number>;
        }
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

    /**
     * Returns comprehensive debug information about the EntitySparseSet.
     * Useful for debugging, testing, and development analysis.
     * @returns Debug information object
    */
    getDebugInfo() {
        return {
            // Basic stats
            capacity: this.capacity(),
            activeEntities: this.activeCount,
            nextEntityId: this.nextItemId,
            
            // Memory usage
            memoryUsagePercent: Math.round((this.activeCount / this.capacity()) * 100 * 100) / 100,
            
            // Free list info
            freeListSize: this.freeList.length,
            freeList: [...this.freeList], // Copy to prevent external mutation
            
            // Entity distribution
            activeEntityIds: this.getAllEntities(),
            
            // Internal arrays (for deep debugging)
            sparse: Array.from(this.sparse), // Convert Int32Array to regular array
            keys: this.keys.slice(0, this.activeCount), // Only active portion
            
            // Fragmentation analysis
            largestGapInSparse: this.getLargestGapInSparse(),
            
            // Validation
            isValid: this.validateInternalState()
        };
    }

    /**
     * Returns essential performance statistics.
     * Lightweight version suitable for production monitoring.
     * @returns Essential stats object
     */
    getStats() {
        return {
            capacity: this.capacity(),
            activeEntities: this.activeCount,
            freeSlots: this.freeList.length,
            memoryUsage: Math.round((this.activeCount / this.capacity()) * 100 * 100) / 100,
            isFull: this.isFull
        };
    }

    /**
     * Validates the internal state of the SparseSet.
     * Useful for debugging and testing.
     * @returns True if the internal state is valid
     */
    private validateInternalState(): boolean {
        try {
            // Check if activeCount matches actual active entities
            let actualActiveCount = 0;
            for (let i = 0; i < this.sparse.length; i++) {
                if (this.sparse[i] !== -1) {
                    actualActiveCount++;
                }
            }
            
            if (actualActiveCount !== this.activeCount) {
                return false;
            }
            
            // Check sparse-dense invariant
            for (let i = 0; i < this.activeCount; i++) {
                const entityId = this.keys[i];
                if (this.sparse[entityId] !== i) {
                    return false;
                }
            }
            
            return true;
        } catch {
            return false;
        }
    }

    /**
     * Finds the largest gap in entity ID allocation.
     * Higher gaps might indicate fragmentation.
     */
    private getLargestGapInSparse(): number {
        let maxGap = 0;
        let currentGap = 0;
        
        for (let i = 0; i < this.nextItemId; i++) {
            if (this.sparse[i] === -1) {
                currentGap++;
            } else {
                maxGap = Math.max(maxGap, currentGap);
                currentGap = 0;
            }
        }
        
        return Math.max(maxGap, currentGap);
    }
    // #endregion
}

export { EntitySparseSet };
