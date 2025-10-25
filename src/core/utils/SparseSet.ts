// PhysicsSparseSet: Add methods for collision detection or spatial partitioning.
// AISparseSet: Add methods for behavior trees or state machines.

class SparseSet<T> {
    protected sparse: Float32Array; // Array where the index represents the item ID
    protected dense: T[]; // Array that holds the actual items
    protected keys: number[]; // dense Array that holds the actual item IDs
    protected freeList: number[]; // keeps track of available dense indices for reuse purpose
    protected itemCount: number = 0;

    constructor(maxEntities: number = 1000) {
        this.sparse = new Float32Array(maxEntities).fill(-1);
        this.dense = new Array(maxEntities).fill(null); // Preallocate memory - better for performance
        this.keys = new Array(maxEntities).fill(-1);
        this.freeList = [];
    }
    
    // #region ITEMS
    /**
     * add a new item and deal with it's sparse and dense index
     * @param entityId 
     * @param value 
     * @returns { number } denseIndex
     */
    addItem(entityId: number, value: T, replace: boolean = false): number {
        if (entityId < 0 || entityId >= this.sparse.length) {
            throw new Error(`Invalid ID: ${entityId}. Must be between 0 and ${this.sparse.length - 1}.`);
        }
        if (this.sparse[entityId] !== -1 && !replace) {
            throw new Error(`Entity ID ${entityId} already exists.`);
        }
        if (replace && this.sparse[entityId] !== -1) {
            this.removeItem(entityId);
        }

        let denseIndex: number;

        if (this.freeList.length > 0) {
            denseIndex = this.freeList.pop()!; // Use free index
        } else {
            denseIndex = this.itemCount; // Use next available index
            if (denseIndex >= this.dense.length) {
                throw new Error('SparseSet is full.'); // Handle capacity overflow
            }
        }

        this.dense[denseIndex] = value;
        this.keys[denseIndex] = entityId;
        this.sparse[entityId] = denseIndex;
        this.itemCount++;

        return denseIndex;
    }

    /**
     * Checks whether an item with the specified `itemId` exists in the SparseSet.
     *
     * @param itemId - The unique identifier of the item to check.
     * @returns `true` if the item exists in the set; otherwise, `false`.
     */
    hasItem(itemId: number): boolean {
        if (itemId < 0 || itemId >= this.sparse.length) {
            throw new Error(`Invalid ID: ${itemId}. Must be between 0 and ${this.sparse.length - 1}.`);
        }
        return this.sparse[itemId] !== -1;
    }

    /**
     * Get the item associated with the given itemId.
     * @param componentId the id of the itemId to get
     * @returns 
     */
    getItem(componentId: number): T | undefined {
        const denseIndex = this.sparse[componentId];
        return denseIndex !== -1 ? this.dense[denseIndex] : undefined;
    }
    
    /**
     * Filters the items in the SparseSet based on a provided predicate function.
     *
     * Iterates over all items and returns an array of objects containing the `itemId` and the corresponding value
     * for each item that satisfies the predicate.
     *
     * @param predicate - A function that takes a value of type `T` and returns a boolean indicating whether the item should be included.
     * @returns An array of objects, each with the properties:
     *   - `itemId`: The unique identifier of the item.
     *   - `value`: The value of type `T` stored in the SparseSet.
     *
     * @example
     * ```typescript
     * const set = new SparseSet<MyType>();
     * // ... add items
     * const filtered = set.filterBy(item => item.isActive);
     * ```
     */
    filterItems(predicate: (value: T) => boolean): { itemId: number; value: T }[] {
        return this.getAllItems().filter(entry => predicate(entry.value));
    }

    /**
     * Applies a callback function to each item in the SparseSet and returns an array of the results.
     *
     * Iterates over all items currently stored in the SparseSet, invoking the provided callback with
     * the item's value and its unique itemId. The return value of each callback invocation is collected
     * into a new array, which is returned.
     *
     * @typeParam U - The type of the values returned by the callback function.
     * @param callback - A function that takes the item's value and its itemId, and returns a value of type U.
     * @returns An array containing the results of applying the callback to each item in the set.
     *
     * @example
     * ```typescript
     * const set = new SparseSet<MyType>();
     * // ... add items
     * const names = set.mapItems((item, id) => item.name);
     * ```
     */
    mapAllItems<U>(callback: (value: T, itemId: number) => U): U[] {
        return this.getAllItems().map(entry => callback(entry.value, entry.itemId));
    }

    /**
     * changes the value associated with the specified `itemId`.
     * @param entityId 
     * @param value 
     */
    updateItem(entityId: number, value: T): void {
        if (!this.hasItem(entityId)) {
            throw new Error(`ID ${entityId} does not exist.`);
        }
        const denseIndex = this.sparse[entityId];
        this.dense[denseIndex] = value;
    }

    /**
     * Removes the item associated with the specified `itemId` from the SparseSet.
     *
     * If the `itemId` is invalid or does not exist in the set, the method does nothing.
     * Internally, this will update the sparse and dense arrays, mark the entry as free,
     * and allow the dense index to be reused for future additions.
     *
     * @param itemId - The unique identifier of the item to remove.
     * @throws {Error} If `itemId` is out of bounds (less than 0 or greater than or equal to the sparse array length).
     *
     * @example
     * ```typescript
     * const set = new SparseSet<MyType>();
     * const id = set.addItem({ name: "Alice" });
     * set.removeItemById(id); // Removes the item with the given id
     * ```
     */
    removeItem(entityId: number): void {
        if (entityId < 0 || entityId >= this.sparse.length || this.sparse[entityId] === -1) {
            // Invalid ID or item does not exist
            return;
        }
        
        const denseIndex = this.sparse[entityId];
        
        // Remove the item in the dense array
        this.removeInDense(denseIndex);
        
        // Mark the sparse entry as removed
        this.sparse[entityId] = -1;
        
        // // Decrement the item count
        this.itemCount--;
    }


    /**
     * @param sortById return an array sort by itemEntityId
     * @returns { Array<{ itemId: number; value: T }> }
     * the data return inside value is a direct reference and allow to be update directly inside it's aimed array
     */
    getAllItems(): { itemId: number; value: T }[] {
        return this.keys
            .map((itemId, denseIndex) => ({ itemId, value: this.dense[denseIndex] }))
            .filter(entry => entry.itemId !== -1); // Exclut les indices non attribués
    }

    /**
     * Returns all the entitite organised by there order id inside the sparse set
    */ 
    getAllItemsSortedById(): { itemId: number; value: T }[] {
        return this.keys
            .map((itemId, denseIndex) => ({ itemId, value: this.dense[denseIndex] }))
            .filter(entry => entry.itemId !== -1)
            .sort((a, b) => a.itemId - b.itemId);
    }

    /**
     * Apply same callback to each component in the SparseSet
     * @param callback 
     */
    forEachItems(callback: (itemId: number, value: T) => void): void {
        for (let i = 0; i < this.keys.length; i++) {
            if (this.keys[i] !== -1) {
                callback(this.keys[i], this.dense[i]);
            }
        }
    }

    // #endregion

    // #region UTILS
    /**
     * Clears all items from the SparseSet, resetting it to its initial empty state.
     */
    clear(): void {
        this.sparse.fill(-1);
        this.dense = [];
        this.keys = [];
        this.freeList = [];
        this.itemCount = 0;
    }

    /**
     * Removes the item at the specified dense index from the SparseSet.
     *
     * This method is intended for internal use. It marks the dense index as free for future reuse,
     * swaps the last item in the dense array into the removed item's position to maintain density,
     * and updates the corresponding keys and sparse arrays. The removed entity's sparse entry is invalidated.
     *
     * @param denseIndex - The index in the dense array of the item to remove.
     *
     * @internal
     */
    protected removeInDense(denseIndex: number): void {
        const lastDenseIndex = this.itemCount;

        // Mark the index as free
        this.freeList.push(denseIndex);

        if (denseIndex !== lastDenseIndex) {
            // Move the last item to the removed index
            this.dense[denseIndex] = this.dense[lastDenseIndex];
            this.keys[denseIndex] = this.keys[lastDenseIndex];

            // Update the sparse reference for the moved entity
            const movedEntityId = this.keys[denseIndex];
            this.sparse[movedEntityId] = denseIndex;
        }

        // Clear the last item
        this.dense[lastDenseIndex] = null as unknown as T;
        this.keys[lastDenseIndex] = -1;
    }

    compact(): void {
        const newDense: T[] = [];
        const newKeys: number[] = [];

        for (let i = 0; i < this.dense.length; i++) {
            if (this.keys[i] !== -1) {
                newDense.push(this.dense[i]);
                newKeys.push(this.keys[i]);
                this.sparse[this.keys[i]] = newDense.length - 1;
            }
        }

        this.dense = newDense;
        this.keys = newKeys;
    }

    /**
     * For debug purposes
     * @returns { total: number; free: number; used: number }
     */
    getStats(): any/*  { total: number; free: number; used: number }  */{
        const realDenseLength = this.dense.filter(item => item !== null).length;
        return {
            sparseList: this.sparse,
            free: this.freeList,
            dense: this.dense,
            denseLength: realDenseLength,
            keys: this.keys,
        };
    }

    /**
     * Returns the number of items currently stored in the SparseSet.
     */
    get size(): number {
        return this.itemCount;
    }
    // #endregion
}

export { SparseSet };