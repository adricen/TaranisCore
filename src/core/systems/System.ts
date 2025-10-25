/**
 * Abstract class for defining a System in the ECS framework.
 * A System processes entities with specific components and contains the logic and behavior of the ECS framework.
 * Systems are responsible for updating the state of entities and their components during the game loop or application lifecycle.
 */
export abstract class System {
    /**
     * Abstract method to update the system.
     * This method must be implemented by subclasses to define the system's behavior.
     * @param deltaTime - Time elapsed since the last update in milliseconds.
     */
    abstract update(deltaTime?: number): void;
    /**
     * Abstract method to dispose of the system.
     * This method must be implemented by subclasses to clean up resources when the system is no longer needed.
     */
    abstract dispose(): void;
}
