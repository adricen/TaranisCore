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
        if (this.queryCache.size > 0) {
            this.clearQueryCache(); // Invalidate cache when world changes
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
        if (this.queryCache.size > 0) {
            this.clearQueryCache(); // Invalidate cache when world changes
        }
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
        if (this.queryCache.size > 0) {
            this.clearQueryCache(); // Invalidate cache when masks change
        }
    }

    /**
     * Process multiple entities at once with batch operations
     */
    addMaskToEntities(entityIds: number[], mask: Partial<Record<keyof E, number>>): void {
        const keys = Object.keys(mask) as Array<keyof E>;
        
        // Process in batches of 8 for better cache locality
        for (let i = 0; i < entityIds.length; i += 8) {
            const end = Math.min(i + 8, entityIds.length);
            
            for (let j = i; j < end; j++) {
                const entityId = entityIds[j];
                if (this.entityExist(entityId)) {
                    for (const key of keys) {
                        if (mask[key] !== undefined) {
                            this.bitSet[entityId][key] |= mask[key];
                        }
                    }
                }
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

    // Add this property to your class
    private queryCache = new Map<string, { result: number[], timestamp: number }>();

    /**
     * Get all entities that match ALL specified masks (AND operation).
     * Most efficient querying - only checks active entities.
     * @param masks - Object specifying which masks to match
     * @param maxResults - Optional limit on number of results
     * @param useCache - Enable caching for repeated queries (useful for systems that query every frame)
     * @returns Array of entity IDs that match ALL specified masks
     */
    getAllByMask(masks: Partial<Record<keyof E, number>>, maxResults?: number, useCache = false): number[] {
        // Check cache first if enabled
        if (useCache) {
            const cacheKey = JSON.stringify(masks);
            const cached = this.queryCache.get(cacheKey);
            if (cached && Date.now() - cached.timestamp < 16) { // Cache for ~1 frame (16ms)
                return maxResults ? cached.result.slice(0, maxResults) : cached.result;
            }
        }
        
        // Perform the actual query (your existing logic)
        const result: number[] = [];
        const keysToCheck = (Object.keys(masks) as Array<keyof E>).filter(key => masks[key] !== undefined);
        
        for (let i = 0; i < this.activeCount; i++) {
            const entityId = this.keys[i];
            const entityMasks = this.bitSet[entityId];
            
            let allMatch = 1; // Use bitwise flags instead of boolean
            for (const key of keysToCheck) {
                allMatch &= ((entityMasks[key] & masks[key]!) === masks[key]!) ? 1 : 0;
            }
            
            if (allMatch) {
                result.push(entityId);
                // Early exit if we hit maxResults
                if (maxResults && result.length >= maxResults) {
                    break;
                }
            }
        }
        
        // Store in cache if enabled (don't cache partial results from maxResults)
        if (useCache && !maxResults) {
            const cacheKey = JSON.stringify(masks);
            this.queryCache.set(cacheKey, { 
                result: [...result], // Copy to prevent external mutation
                timestamp: Date.now() 
            });
        }
        
        return result;
    }

    /**
     * Clears the query cache. Call this when entities are created/deleted/modified
     * to ensure cache consistency.
     */
    clearQueryCache(): void {
        this.queryCache.clear();
    }

    /**
     * Clear old cache entries (call periodically to prevent memory leaks)
     */
    private cleanupQueryCache(): void {
        const now = Date.now();
        for (const [key, value] of this.queryCache.entries()) {
            if (now - value.timestamp > 100) { // Remove entries older than 100ms
                this.queryCache.delete(key);
            }
        }
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
     * Specialized version for single-mask queries (most common case)
     */
    getAllByCoreMask(coreMask: number): number[] {
        const result: number[] = [];
        
        for (let i = 0; i < this.activeCount; i++) {
            const entityId = this.keys[i];
            if ((this.bitSet[entityId].Core & coreMask) === coreMask) {
                result.push(entityId);
            }
        }
        
        return result;
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
    private resetBitset(bitset: Record<keyof E, number>): void {
        (Object.keys(bitset) as Array<keyof E>).forEach(key => {
            bitset[key] = 0;
        });
    }

    clear(): void {
        this.sparse.fill(-1);
        this.keys.fill(-1);
        this.freeList = [];
        this.nextItemId = 0;
        this.activeCount = 0; // ← Missing!
        
        // Optional: Reset bitsets too
        for (let i = 0; i < this.bitSet.length; i++) {
            this.resetBitset(this.bitSet[i]); // Reuse instead of recreate
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
