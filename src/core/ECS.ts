import { EntityTypeMask } from "@/core/utils/EntityTypeMask";
import { EntitySparseSet } from "core/utils/EntitySparseSet";
import { SparseSet } from "core/utils/SparseSet";
import type { GlobalFamilyType } from "@/core/utils/GlobalFamilyType";
import type { System } from "./systems/System";

class ECS<
    F extends GlobalFamilyType = GlobalFamilyType,  // relative to component family
    E extends EntityTypeMask = EntityTypeMask,      // Relative to TypeMask - usefull to get aim specific ID (Mouse, Canvas, etc.)
    S extends System = System,                        // Relative to System - usefull to add system with specific ECS type
> {
    protected maxEntities: number;
    protected entities: EntitySparseSet<E>;
    /**
     * Map structure:
     * Map<FamilyName, Map<ComponentName, SparseSet<ComponentData>>>
     */
    protected components: Map<keyof F, Map<keyof F[keyof F], SparseSet<keyof F[keyof F][keyof F[keyof F]]>>>;
    protected systems: Array<S>;

    constructor(maxEntities: number = 1000) {
        this.maxEntities = maxEntities;
        this.entities = new EntitySparseSet<E>(maxEntities);
        this.components = new Map();
        this.systems = [];
    }

    // #region ENTITIES
    /**
     * @param { EntityTypeMask } mask - The initial Mask assign to an entity
     * @returns The ID of the newly created entity
     * @throws { Error } If the maximum number of entities is reached
     * @note This is usefull if you want to ahve direct access to some entity type - like Mouse, Canvas, etc.
     */
    createEntity(mask?: E): number {
        try {
            return this.entities.createEntity(mask);
        } catch (error) {
            throw this.handleError(`Failed to create as new entity.\nYour maximum entities is set to ${this.maxEntities}.\nTry to make some room by deleting some unused Entity or increase the maxEntities at ECS constructor.`, error);
        }
    }

    hasEntity(entityId: number): boolean {
        return this.entities.hasEntity(entityId);
    }
    /**
     * @description Delete the entity and all of it's link inside component SparseSet
     * @param { number } entityId - The ID of the entity to delete
     * @throws { Error } If the entity does not exist
     * @returns { void }
    */
    removeEntity(entityId: number): void {
        try {
            if (!this.entities.hasEntity(entityId)) {
                // Si l'entité n'existe pas, ne rien faire
                return;
            }
            // Remove all components linked to the entity
            this.removeAllComponentsFromEntity(entityId);

            // Delete the entity itself
            this.entities.deleteEntity(entityId);
        } catch (error) {
            this.handleError(`Failed to delete entity ${entityId}: `, error);
        }
    }
    // #endregion
    // #region Masks

    /**
     * @description Add a bitwise mask to an entity - usefull for rapide type selection like Mouse, Canvas, etc. or multiple masks like Mouse | Canvas => return Mouse + Canvas
     * @param entityId 
     * @param { EntityTypeMask } as E Bitwise Mask to add to the entity
     * @returns { void }
     * @throws { Error } If the entity does not exist
     */
    addTypeMaskToEntity(entityId: number, mask: E): void {
        try {
            this.entities.addMaskToEntity(entityId, mask);
        } catch (error) {
            this.handleError(`Failed to add mask to entity ${entityId}: `, error);
        }
    }

    /**
     * @description Remove a bitwise mask from an entity - usefull for statemanagement for exemple - entity.state &= ~EntityTypeMask.Visible => remove Visible mask
     * @param entityId 
     * @param mask 
    */
    removeMask(entityId: number, mask: E): void {
        this.entities.removeMaskFromEntity(entityId, mask);
    }
    
    /**
     * @description Get every activated bitwise mask name of an entity
     * @param entityId 
     * @returns EveryMask Name activated on the entity
     * @todo Maybe compare it with EntityTypeMask to know wich type mask it is
    */
    getMask(entityId: number) {
        // TODO: Maybe compare it with EntityTypeMask to know wich type mask it is
        return this.entities.getMask(entityId);
    }
    // #endregion
    
    // #region COMPONENTS
    
    /**
     * Registers a new component family.
     * due to masks - need to registrer a family to group components
     * @param familyName - The name of the component family
     * @throws { Error } If the family is already registered
     * @note A family is a group of components that share the same purpose
     * @example A "Transform" family could contain "Position", "Rotation" and "Scale" components
    */
    registerFamily<K extends keyof F>(ComponentFamilyName: K): void {
        if (this.components.has(ComponentFamilyName)) {
            throw new Error(`Family ${String(ComponentFamilyName)} is already registered.`);
        }
        this.components.set(ComponentFamilyName, new Map());
    }

    /**
     * 
     * @param familyName 
     * @param componentName 
     */
    familyRegistered<K extends keyof F>(
        ComponentFamilyName: K
    ): boolean {
        const family = this.components.get(ComponentFamilyName);
        if (!family) {
            return false;
        }
        return true
    }
    
    /**
     * Registers a new component within a family.
     * @note probably note good. We want a component to be efficient when a family is registered adn don't have to register it since it belong to a family
     */
    registerComponent<K extends keyof F, C extends keyof F[K]>(
        ComponentFamilyName: K,
        componentName: C,
    ): void {
        const family = this.components.get(ComponentFamilyName);
        if (!family) {
            throw new Error(`Family ${String(ComponentFamilyName)} is not registered.`);
        }
        // Ensure the component is not already registered in the family
        if (family.has(componentName as unknown as keyof F[keyof F]))
            throw new Error(`Component ${String(componentName)} is already registered in family ${String(ComponentFamilyName)}.`);
        family.set(componentName as unknown as keyof F[keyof F], new SparseSet());
    }

    /**
     * Adds a component to an entity.
     * @note the type value may look a little bit overkill but
     * without that the automatic inference doesn't work properly
     */
    addComponent<K extends keyof F, C extends keyof F[K]>(
        entityId: number,
        ComponentFamilyName: K,
        componentName: C,
        componentData: F[K][C],
    ): void {
        let family = this.components.get(ComponentFamilyName);
        if (!family) {
            this.registerFamily(ComponentFamilyName);
            family = this.components.get(ComponentFamilyName)!;
        }
        let componentSet = family.get(componentName as unknown as keyof F[keyof F]);
        if (!componentSet) {
            this.registerComponent(ComponentFamilyName, componentName as unknown as keyof F[keyof F]);
            componentSet = family.get(componentName as unknown as keyof F[keyof F])!;
        }
        componentSet.addItem(entityId, componentData as unknown as keyof F[keyof F][keyof F[keyof F]]);
    }

    /**
     * Removes a component from an entity.
     */
    removeComponent<K extends keyof F, C extends keyof F[K]>(
        entityId: number,
        ComponentFamilyName: K,
        componentMask: C
    ): void {
        if (!this.entities.hasEntity(entityId)) {
            // Si l'entité n'existe pas, ne rien faire
            return;
        }
        const family = this.components.get(ComponentFamilyName);
        if (!family) {
            throw new Error(`Family ${String(ComponentFamilyName)} is not registered.`);
        }
        const componentSet = family.get(componentMask as unknown as keyof F[keyof F]);
        if (!componentSet) {
            throw new Error(`Component ${String(componentMask)} is not registered in family ${String(ComponentFamilyName)}.`);
        }
        componentSet.removeItem(entityId);
    }

    /**
     * Gets all entities that have a specific component.
     * @improvement the name is not ok with it's goal
     */
    getAllEntitiesWithComponent<K extends keyof F, C extends keyof F[K]>(
        ComponentFamilyName: K,
        componentName: C
    ): { 
        itemId: number;
        value: F[K][C];
    }[] {
        const family = this.components.get(ComponentFamilyName);
        if (!family) {
            throw new Error(`Family ${String(ComponentFamilyName)} is not registered.`);
        }
        const componentSet = family.get(componentName as unknown as keyof F[keyof F]);
        if (!componentSet) {
            throw new Error(`Component ${String(componentName)} is not registered in family ${String(ComponentFamilyName)}.`);
        }
        return componentSet.getAllItems() as { itemId: number; value: F[K][C]; }[];
    }
    
    /**
     * Gets the number of entities that have a specific component.
     * @note probably useless...
     * @todo use Mask
     */
    getComponentEntityCount<K extends keyof F, C extends keyof F[K]>(
        ComponentFamilyName: K,
        componentName: C,
    ): number {
        const family = this.components.get(ComponentFamilyName);
        if (!family) {
            throw new Error(`Family ${String(ComponentFamilyName)} is not registered.`);
        }
        const componentSet = family.get(componentName as unknown as keyof F[keyof F]);
        if (!componentSet) {
            throw new Error(`Component ${String(componentName)} is not registered in family ${String(ComponentFamilyName)}.`);
        }
        return componentSet.size;
    }

    /**
     * Checks if an entity exists in the SparseSet.
     */
    isAlive(entityId: number): boolean {
        return this.entities.hasEntity(entityId);
    }

    /**
     * Removes all components associated with the given entity.
     * @param { number } entityId - The ID of the entity.
     */
    private removeAllComponentsFromEntity(entityId: number): void {
        this.components.forEach((family) => {
            family.forEach((componentSet) => {
                if (componentSet.hasItem(entityId)) {
                    componentSet.removeItem(entityId);
                }
            });
        });
    }
    // #endregion
    
    // #region SYSTEMS
    addSystem(systemCallback: S) {
        this.systems.push(systemCallback);
    }
    removeSystem(systemCallback: S) {
        // FIXME: not good actually since system is instanciated on creation - won't be available on time 
        const index = this.systems.indexOf(systemCallback);
        if (index !== -1) {
            this.systems.splice(index, 1);
        }
    }
    updateSystems(deltaTime: number): void {
        for (const system of this.systems) {
            system.update(deltaTime);
        }
    }
    disposeSystems(): void {
        for (const system of this.systems) {
            system.dispose();
        }
    }
    // #endregion

    // #region QUERIES
    /**
     * @description Get all existing entity IDs
     * @returns { number[] } Array of all entity IDs
     * @note Usefull for iteration over all entities
    */
   getAllEntity(): number[] {
       return this.entities.getAllEntities();
    }
    
    /**
     * Return all entity id that match the given mask.
     * @param mask - The mask to filter entities by
     * @returns { number[] } array of entity id
     * @note Usefull to get all entity of a given type
     * @exemple EntityTypeMask.Particle
    */
   getEntitiesByMask(mask: E): number[] {
       return this.entities.getAllByMask(mask);
    }
    
    /**
     * Return the first entity Id that match the given mask.
     * @param mask 
     * @returns { number | null }
     * @note Usefull to get unique type entity Id like Mouse, Canvas, etc.
     * @exemple EntityTypeMask.Mouse
    */
   getFirstEntityByMask(mask: E): number | null {
       return this.entities.getFirstByMaks(mask);
    }

    /**
    * Checks if an entity has a specific component.
    * @improvement use Mask
    */
    hasComponent<K extends keyof F, C extends keyof F[K]>(
        entityId: number,
        familyName: K,
        componentMask: C
    ): boolean {
        const family = this.components.get(familyName);
        if (!family) {
            throw new Error(`Family ${String(familyName)} is not registered.`);
        }
        const componentSet = family.get(componentMask as unknown as keyof F[keyof F]);
        if (!componentSet) {
            throw new Error(`Component ${String(componentMask)} is not registered in family ${String(familyName)}.`);
        }
        return componentSet.hasItem(entityId);
    }

    /**
     * Gets a component from an entity.
     * @todo use masks!
     * @todo family name could be optionnal since we could want to get all the
     * components from one entity
     */
    getComponent<K extends keyof F, C extends keyof F[K]>(
        entityId: number,
        familyName: K,
        componentMask: C,
    ): F[K][C] | undefined {
        if (!this.entities.hasEntity(entityId)) {
            // Si l'entité n'existe pas, retourne undefined
            return undefined;
        }
        const family = this.components.get(familyName);
        if (!family) {
            throw new Error(`Family ${String(familyName)} is not registered.`);
        }
        const componentSet = family.get(componentMask as unknown as keyof F[keyof F]);
        if (!componentSet) {
            throw new Error(`Component ${String(componentMask)} is not registered in family ${String(familyName)}.`);
        }
        return componentSet.getItem(entityId) as F[K][C] | undefined;
    }
    // #endregion

    // #region UTILS
    protected handleError(message: string, error: unknown): void {
        console.error(`${message}: ${(error as Error).message}`);
        throw error;
    }
    /**
     * Get some basic stats about the ECS instance.
     * @returns An object containing the maximum number of entities and the current number of entities.
     */
    getStats(): { maxEntities: number; currentEntities: number } {
        return {
            maxEntities: this.maxEntities,
            currentEntities: this.entities.getStats().used,
        };
    }
    // #endregion
}

export { ECS };