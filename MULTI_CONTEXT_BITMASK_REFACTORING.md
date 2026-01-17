# Multi-Context Bitmask System - Complete Refactoring Strategy

## 🎯 Overview

This document outlines the complete refactoring strategy to implement a multi-context bitmask system for TaranisCore ECS engine. This approach solves the 32-bit limitation while maintaining extreme extensibility for complex games like dungeon crawlers.

## 🏗️ Architecture Goals

- **Unlimited Scalability**: Each context gets 32 bits (256+ contexts possible)
- **Domain Separation**: Physics doesn't pollute combat logic
- **Complex Queries**: Multi-context filtering for sophisticated game mechanics
- **Modding Support**: Easy to add new contexts without touching existing ones
- **Performance**: Each context optimized independently
- **Backward Compatibility**: Existing code continues to work

## 📁 File Structure

```
src/core/bitmasks/
├── UnifiedBitmask.ts          # Core multi-context bitmask system
├── ContextMasks.ts            # All context-specific mask enums
├── EnhancedGlobalFamilyType.ts # Enhanced family type system
├── CoreMask.ts                # Legacy (keep for compatibility)
├── TransformMask.ts           # Legacy (keep for compatibility)
├── PhysiqueMask.ts           # Legacy (keep for compatibility)
└── AiMask.ts                 # Legacy (keep for compatibility)
```

## 🔧 Phase 1: Foundation Files

### 1. UnifiedBitmask.ts

```typescript
/**
 * UnifiedBitmask - Multi-Context Bitmask System for TaranisCore ECS
 * 
 * This system allows for unlimited contexts (each with 32 bits) to organize
 * components into logical domains while maintaining high performance bitwise operations.
 */

export type ContextId = string;
export type ContextMask = number;
export type ContextMaskMap = Record<ContextId, ContextMask>;

export interface UnifiedBitmaskContext {
    readonly id: ContextId;
    readonly name: string;
    readonly description?: string;
    readonly maxBits: number;
}

export class UnifiedBitmask {
    private readonly contexts: Map<ContextId, ContextMask>;
    private readonly contextConfigs: Map<ContextId, UnifiedBitmaskContext>;

    constructor(initialContexts?: ContextMaskMap) {
        this.contexts = new Map();
        this.contextConfigs = new Map();

        if (initialContexts) {
            for (const [contextId, mask] of Object.entries(initialContexts)) {
                this.contexts.set(contextId, mask);
            }
        }
    }

    registerContext(config: UnifiedBitmaskContext): void {
        if (this.contextConfigs.has(config.id)) {
            throw new Error(`Context '${config.id}' is already registered`);
        }
        
        if (config.maxBits > 32) {
            throw new Error(`Context '${config.id}' cannot exceed 32 bits`);
        }

        this.contextConfigs.set(config.id, config);
        
        if (!this.contexts.has(config.id)) {
            this.contexts.set(config.id, 0);
        }
    }

    setContextMask(contextId: ContextId, mask: ContextMask): UnifiedBitmask {
        this.validateContext(contextId);
        this.contexts.set(contextId, mask);
        return this;
    }

    getContextMask(contextId: ContextId): ContextMask {
        this.validateContext(contextId);
        return this.contexts.get(contextId) || 0;
    }

    addToContext(contextId: ContextId, flags: ContextMask): UnifiedBitmask {
        this.validateContext(contextId);
        const currentMask = this.contexts.get(contextId) || 0;
        this.contexts.set(contextId, currentMask | flags);
        return this;
    }

    removeFromContext(contextId: ContextId, flags: ContextMask): UnifiedBitmask {
        this.validateContext(contextId);
        const currentMask = this.contexts.get(contextId) || 0;
        this.contexts.set(contextId, currentMask & ~flags);
        return this;
    }

    hasInContext(contextId: ContextId, flags: ContextMask): boolean {
        this.validateContext(contextId);
        const currentMask = this.contexts.get(contextId) || 0;
        return (currentMask & flags) === flags;
    }

    hasAnyInContext(contextId: ContextId, flags: ContextMask): boolean {
        this.validateContext(contextId);
        const currentMask = this.contexts.get(contextId) || 0;
        return (currentMask & flags) !== 0;
    }

    clone(): UnifiedBitmask {
        const contextMap: ContextMaskMap = {};
        for (const [contextId, mask] of this.contexts) {
            contextMap[contextId] = mask;
        }
        
        const clone = new UnifiedBitmask(contextMap);
        
        for (const [contextId, config] of this.contextConfigs) {
            clone.contextConfigs.set(contextId, { ...config });
        }
        
        return clone;
    }

    isCompatibleWith(required: UnifiedBitmask): boolean {
        for (const [contextId, requiredMask] of required.contexts) {
            if (requiredMask !== 0) {
                const ourMask = this.contexts.get(contextId) || 0;
                if ((ourMask & requiredMask) !== requiredMask) {
                    return false;
                }
            }
        }
        return true;
    }

    getContextIds(): ContextId[] {
        return Array.from(this.contexts.keys());
    }

    toPlainObject(): ContextMaskMap {
        const result: ContextMaskMap = {};
        for (const [contextId, mask] of this.contexts) {
            result[contextId] = mask;
        }
        return result;
    }

    static fromPlainObject(obj: ContextMaskMap): UnifiedBitmask {
        return new UnifiedBitmask(obj);
    }

    private validateContext(contextId: ContextId): void {
        if (!this.contexts.has(contextId)) {
            this.contexts.set(contextId, 0);
        }
    }
}

export class UnifiedBitmaskBuilder {
    private readonly bitmask: UnifiedBitmask;

    constructor() {
        this.bitmask = new UnifiedBitmask();
    }

    addFlags(contextId: ContextId, flags: ContextMask): UnifiedBitmaskBuilder {
        this.bitmask.addToContext(contextId, flags);
        return this;
    }

    build(): UnifiedBitmask {
        return this.bitmask.clone();
    }
}
```

### 2. ContextMasks.ts

```typescript
/**
 * ContextMasks - Context-specific bitmask enums for TaranisCore ECS
 * 
 * This file defines bitmask enums for different game domains, each using
 * a separate 32-bit register for optimal performance and clear separation of concerns.
 */

// #region Core Game Context
export enum CoreMask {
    Position = 1 << 0,      // 1 - Basic position in world space
    Rotation = 1 << 1,      // 2 - Rotation/orientation  
    Scale = 1 << 2,         // 4 - Scale/size
    Renderable = 1 << 3,    // 8 - Can be rendered
    HtmlElement = 1 << 4,   // 16 - Has HTML DOM element
    Visible = 1 << 5,       // 32 - Is currently visible
    Active = 1 << 6,        // 64 - Is currently active/enabled
    Persistent = 1 << 7,    // 128 - Survives scene changes
    Dirty = 1 << 8,         // 256 - Needs update/recalculation
    Debug = 1 << 9,         // 512 - Debug visualization enabled
    Named = 1 << 10,        // 1024 - Has a name/identifier
    Tagged = 1 << 11,       // 2048 - Has tags for categorization
}

// #region Physics Context
export enum PhysicsMask {
    Velocity = 1 << 0,        // 1 - Linear velocity
    AngularVelocity = 1 << 1, // 2 - Rotational velocity
    Mass = 1 << 2,            // 4 - Physical mass
    Acceleration = 1 << 3,    // 8 - Linear acceleration
    Force = 1 << 4,           // 16 - Applied forces
    Torque = 1 << 5,          // 32 - Applied torques
    RigidBody = 1 << 6,       // 64 - Rigid body dynamics
    Collider = 1 << 7,        // 128 - Collision detection
    Trigger = 1 << 8,         // 256 - Trigger/sensor volume
    Kinematic = 1 << 9,       // 512 - Kinematic body (no physics forces)
    Static = 1 << 10,         // 1024 - Static body (immovable)
    Gravity = 1 << 11,        // 2048 - Affected by gravity
    Friction = 1 << 12,       // 4096 - Has friction properties
    Bounce = 1 << 13,         // 8192 - Has restitution/bounciness
    Constraint = 1 << 14,     // 16384 - Has physics constraints
    Sensor = 1 << 15,         // 32768 - Is a sensor (no collision response)
}

// #region Combat Context
export enum CombatMask {
    Health = 1 << 0,          // 1 - Health points
    MaxHealth = 1 << 1,       // 2 - Maximum health
    Damage = 1 << 2,          // 4 - Damage dealing capability
    Armor = 1 << 3,           // 8 - Damage reduction
    WeaponSlot = 1 << 4,      // 16 - Can equip weapons
    Shield = 1 << 5,          // 32 - Shield/blocking capability
    AttackPower = 1 << 6,     // 64 - Base attack strength
    DefensePower = 1 << 7,    // 128 - Base defense strength
    CriticalHit = 1 << 8,     // 256 - Critical hit capability
    Dodge = 1 << 9,           // 512 - Dodge/evasion capability
    Block = 1 << 10,          // 1024 - Blocking capability
    Parry = 1 << 11,          // 2048 - Parry capability
    Vulnerable = 1 << 12,     // 4096 - Takes extra damage
    Immune = 1 << 13,         // 8192 - Immune to certain damage types
    Regeneration = 1 << 14,   // 16384 - Health regeneration
    Berserker = 1 << 15,      // 32768 - Berserker mode
}

// #region Magic Context
export enum MagicMask {
    SpellCaster = 1 << 0,     // 1 - Can cast spells
    Mana = 1 << 1,            // 2 - Mana/magic points
    MaxMana = 1 << 2,         // 4 - Maximum mana
    ManaRegeneration = 1 << 3, // 8 - Mana regeneration rate
    SpellEffect = 1 << 4,     // 16 - Active spell effects
    MagicResistance = 1 << 5, // 32 - Resistance to magic
    ElementalAffinity = 1 << 6, // 64 - Elemental magic affinity
    SpellBook = 1 << 7,       // 128 - Collection of known spells
    Enchanted = 1 << 8,       // 256 - Has magical enchantments
    MagicAmplifier = 1 << 9,  // 512 - Amplifies magic power
    SpellCooldown = 1 << 10,  // 1024 - Spell cooldown management
    Dispellable = 1 << 11,    // 2048 - Can be dispelled
    MagicImmune = 1 << 12,    // 4096 - Immune to magic
    Cursed = 1 << 13,         // 8192 - Under a curse
    Blessed = 1 << 14,        // 16384 - Under a blessing
    Arcane = 1 << 15,         // 32768 - Arcane magic user
}

// #region Status Effects Context
export enum StatusMask {
    Poisoned = 1 << 0,        // 1 - Taking poison damage
    Burning = 1 << 1,         // 2 - Taking fire damage
    Frozen = 1 << 2,          // 4 - Movement/actions slowed or stopped
    Stunned = 1 << 3,         // 8 - Cannot perform actions
    Paralyzed = 1 << 4,       // 16 - Cannot move
    Confused = 1 << 5,        // 32 - Random/reversed controls
    Charmed = 1 << 6,         // 64 - Under enemy control
    Feared = 1 << 7,          // 128 - Running away uncontrollably
    Sleeping = 1 << 8,        // 256 - Unconscious
    Invisible = 1 << 9,       // 512 - Cannot be seen
    Invulnerable = 1 << 10,   // 1024 - Cannot take damage
    Haste = 1 << 11,          // 2048 - Increased speed/actions
    Slow = 1 << 12,           // 4096 - Decreased speed/actions
    Bleeding = 1 << 13,       // 8192 - Taking continuous damage
    Blinded = 1 << 14,        // 16384 - Cannot see/reduced accuracy
    Silenced = 1 << 15,       // 32768 - Cannot cast spells
}

// #region AI Context
export enum AIMask {
    BehaviorTree = 1 << 0,    // 1 - Behavior tree AI
    StateMachine = 1 << 1,    // 2 - State machine AI
    Pathfinding = 1 << 2,     // 4 - Pathfinding capability
    CombatAI = 1 << 3,        // 8 - Combat behavior
    PatrolAI = 1 << 4,        // 16 - Patrol behavior
    ChaseAI = 1 << 5,         // 32 - Chase/pursuit behavior
    FleeAI = 1 << 6,          // 64 - Flee/escape behavior
    IdleAI = 1 << 7,          // 128 - Idle/waiting behavior
    AggressiveAI = 1 << 8,    // 256 - Aggressive behavior patterns
    DefensiveAI = 1 << 9,     // 512 - Defensive behavior patterns
    GroupAI = 1 << 10,        // 1024 - Group/swarm behavior
    LeaderAI = 1 << 11,       // 2048 - Leadership behavior
    FollowerAI = 1 << 12,     // 4096 - Following behavior
    GuardAI = 1 << 13,        // 8192 - Guarding behavior
    WanderAI = 1 << 14,       // 16384 - Random wandering
    HuntAI = 1 << 15,         // 32768 - Hunting behavior
}

// #region Inventory Context
export enum InventoryMask {
    Container = 1 << 0,       // 1 - Can hold items
    Stackable = 1 << 1,       // 2 - Items can stack
    Equippable = 1 << 2,      // 4 - Can be equipped
    Consumable = 1 << 3,      // 8 - Can be consumed/used
    Weapon = 1 << 4,          // 16 - Is a weapon
    Armor = 1 << 5,           // 32 - Is armor
    Tool = 1 << 6,            // 64 - Is a tool
    QuestItem = 1 << 7,       // 128 - Quest-related item
    Valuable = 1 << 8,        // 256 - Has monetary value
    Craftable = 1 << 9,       // 512 - Can be crafted
    CraftingMaterial = 1 << 10, // 1024 - Used in crafting
    Tradeable = 1 << 11,      // 2048 - Can be traded
    Droppable = 1 << 12,      // 4096 - Can be dropped
    Sellable = 1 << 13,       // 8192 - Can be sold
    Repairable = 1 << 14,     // 16384 - Can be repaired
    Upgradeable = 1 << 15,    // 32768 - Can be upgraded
}

// #region Environment Context
export enum EnvironmentMask {
    Door = 1 << 0,            // 1 - Openable door
    Chest = 1 << 1,           // 2 - Container with loot
    Trap = 1 << 2,            // 4 - Harmful trap
    Treasure = 1 << 3,        // 8 - Valuable treasure
    Interactable = 1 << 4,    // 16 - Can be interacted with
    Breakable = 1 << 5,       // 32 - Can be destroyed
    Moveable = 1 << 6,        // 64 - Can be moved/pushed
    Climbable = 1 << 7,       // 128 - Can be climbed
    Switch = 1 << 8,          // 256 - Activatable switch
    Platform = 1 << 9,        // 512 - Platform for standing
    Ladder = 1 << 10,         // 1024 - Ladder for climbing
    Water = 1 << 11,          // 2048 - Water body
    Lava = 1 << 12,           // 4096 - Lava/harmful liquid
    Teleporter = 1 << 13,     // 8192 - Teleportation device
    SavePoint = 1 << 14,      // 16384 - Game save location
    SpawnPoint = 1 << 15,     // 32768 - Entity spawn location
}

// #region Utility Types
export type ContextType = 
    | 'Core'
    | 'Physics'
    | 'Combat'
    | 'Magic'
    | 'Status'
    | 'AI'
    | 'Inventory'
    | 'Environment';

export type AnyMask = 
    | CoreMask
    | PhysicsMask
    | CombatMask
    | MagicMask
    | StatusMask
    | AIMask
    | InventoryMask
    | EnvironmentMask;

export const CONTEXT_CONFIGS = {
    Core: {
        id: 'Core' as const,
        name: 'Core Components',
        description: 'Fundamental entity properties and basic functionality',
        maxBits: 32,
        maskEnum: CoreMask
    },
    Physics: {
        id: 'Physics' as const,
        name: 'Physics Components',
        description: 'Physics simulation and collision detection',
        maxBits: 32,
        maskEnum: PhysicsMask
    },
    Combat: {
        id: 'Combat' as const,
        name: 'Combat Components',
        description: 'Combat, damage, and defensive capabilities',
        maxBits: 32,
        maskEnum: CombatMask
    },
    Magic: {
        id: 'Magic' as const,
        name: 'Magic Components',
        description: 'Spells, mana, and magical effects',
        maxBits: 32,
        maskEnum: MagicMask
    },
    Status: {
        id: 'Status' as const,
        name: 'Status Effects',
        description: 'Temporary conditions and status effects',
        maxBits: 32,
        maskEnum: StatusMask
    },
    AI: {
        id: 'AI' as const,
        name: 'AI Components',
        description: 'Artificial intelligence and behavior patterns',
        maxBits: 32,
        maskEnum: AIMask
    },
    Inventory: {
        id: 'Inventory' as const,
        name: 'Inventory Components',
        description: 'Items, equipment, and inventory management',
        maxBits: 32,
        maskEnum: InventoryMask
    },
    Environment: {
        id: 'Environment' as const,
        name: 'Environment Components',
        description: 'Environmental objects and world interactions',
        maxBits: 32,
        maskEnum: EnvironmentMask
    }
} as const;
```

### 3. EnhancedGlobalFamilyType.ts

```typescript
/**
 * EnhancedGlobalFamilyType - Multi-Context Component Family System
 * 
 * This enhanced version supports the multi-context bitmask approach
 * while maintaining backward compatibility with existing code.
 */

import { UnifiedBitmask, ContextId } from './UnifiedBitmask';
import { 
    CoreMask, 
    PhysicsMask, 
    CombatMask, 
    MagicMask, 
    StatusMask, 
    AIMask, 
    InventoryMask, 
    EnvironmentMask,
    ContextType
} from './ContextMasks';

// Import existing component types for backward compatibility
import type { Position } from '../components/Position';
import type { Rotation } from '../components/Rotation';
import type { Scale } from '../components/Scale';
import type { Visible } from '../components/Visible';
import type { HtmlElementContainer } from '../components/HtmlElementContainer';

// #region Component Type Definitions

// Core component types
export interface CoreComponents {
    [CoreMask.Position]: Position;
    [CoreMask.Rotation]: Rotation;
    [CoreMask.Scale]: Scale;
    [CoreMask.Renderable]: Visible;
    [CoreMask.HtmlElement]: HtmlElementContainer;
    [CoreMask.Visible]: { visible: boolean };
    [CoreMask.Active]: { active: boolean };
    [CoreMask.Persistent]: { persistent: boolean };
    [CoreMask.Dirty]: { dirty: boolean };
    [CoreMask.Debug]: { debug: boolean };
    [CoreMask.Named]: { name: string };
    [CoreMask.Tagged]: { tags: string[] };
}

// Physics component types
export interface PhysicsComponents {
    [PhysicsMask.Velocity]: { x: number; y: number; z?: number };
    [PhysicsMask.AngularVelocity]: { x: number; y: number; z: number };
    [PhysicsMask.Mass]: { mass: number };
    [PhysicsMask.Acceleration]: { x: number; y: number; z?: number };
    [PhysicsMask.Force]: { x: number; y: number; z?: number };
    [PhysicsMask.Torque]: { x: number; y: number; z: number };
    [PhysicsMask.RigidBody]: { 
        type: 'dynamic' | 'static' | 'kinematic';
        restitution?: number;
        friction?: number;
    };
    [PhysicsMask.Collider]: {
        shape: 'box' | 'sphere' | 'capsule' | 'mesh';
        bounds: { width: number; height: number; depth?: number };
        isTrigger?: boolean;
    };
    [PhysicsMask.Trigger]: { onEnter?: () => void; onExit?: () => void };
    [PhysicsMask.Kinematic]: { kinematic: true };
    [PhysicsMask.Static]: { static: true };
    [PhysicsMask.Gravity]: { gravityScale: number };
    [PhysicsMask.Friction]: { friction: number };
    [PhysicsMask.Bounce]: { restitution: number };
    [PhysicsMask.Constraint]: { constraints: any[] };
    [PhysicsMask.Sensor]: { sensor: true };
}

// Combat component types  
export interface CombatComponents {
    [CombatMask.Health]: { current: number; max: number };
    [CombatMask.MaxHealth]: { max: number };
    [CombatMask.Damage]: { amount: number; type?: string };
    [CombatMask.Armor]: { value: number; type?: string };
    [CombatMask.WeaponSlot]: { equipped?: any; damage?: number };
    [CombatMask.Shield]: { value: number; durability?: number };
    [CombatMask.AttackPower]: { power: number };
    [CombatMask.DefensePower]: { defense: number };
    [CombatMask.CriticalHit]: { chance: number; multiplier: number };
    [CombatMask.Dodge]: { chance: number };
    [CombatMask.Block]: { chance: number; reduction: number };
    [CombatMask.Parry]: { chance: number; counterDamage?: number };
    [CombatMask.Vulnerable]: { multiplier: number; types?: string[] };
    [CombatMask.Immune]: { types: string[] };
    [CombatMask.Regeneration]: { rate: number; interval: number };
    [CombatMask.Berserker]: { damageBonus: number; defenseReduction: number };
}

// Enhanced Global Family Type
export interface EnhancedGlobalFamilyType {
    // Traditional context families (backward compatibility)
    Transform: {
        [CoreMask.Position]: Position;
        [CoreMask.Rotation]: Rotation;
        [CoreMask.Scale]: Scale;
    };
    Core: {
        [CoreMask.Renderable]: Visible;
        [CoreMask.HtmlElement]: HtmlElementContainer;
    };

    // New multi-context families
    CoreContext: CoreComponents;
    PhysicsContext: PhysicsComponents;
    CombatContext: CombatComponents;
    // ... additional contexts as needed
}

// Multi-context query builder
export class ContextQueryBuilder {
    private readonly masks: Map<ContextId, number> = new Map();

    withCore(...flags: CoreMask[]): ContextQueryBuilder {
        return this.addContext('Core', ...flags);
    }

    withPhysics(...flags: PhysicsMask[]): ContextQueryBuilder {
        return this.addContext('Physics', ...flags);
    }

    withCombat(...flags: CombatMask[]): ContextQueryBuilder {
        return this.addContext('Combat', ...flags);
    }

    withMagic(...flags: MagicMask[]): ContextQueryBuilder {
        return this.addContext('Magic', ...flags);
    }

    withStatus(...flags: StatusMask[]): ContextQueryBuilder {
        return this.addContext('Status', ...flags);
    }

    withAI(...flags: AIMask[]): ContextQueryBuilder {
        return this.addContext('AI', ...flags);
    }

    withInventory(...flags: InventoryMask[]): ContextQueryBuilder {
        return this.addContext('Inventory', ...flags);
    }

    withEnvironment(...flags: EnvironmentMask[]): ContextQueryBuilder {
        return this.addContext('Environment', ...flags);
    }

    withContext(contextId: ContextId, ...flags: number[]): ContextQueryBuilder {
        return this.addContext(contextId, ...flags);
    }

    build(): UnifiedBitmask {
        const contextMap: Record<string, number> = {};
        for (const [contextId, mask] of this.masks) {
            contextMap[contextId] = mask;
        }
        return UnifiedBitmask.fromPlainObject(contextMap);
    }

    private addContext(contextId: ContextId, ...flags: number[]): ContextQueryBuilder {
        const currentMask = this.masks.get(contextId) || 0;
        let newMask = currentMask;
        
        for (const flag of flags) {
            newMask |= flag;
        }
        
        this.masks.set(contextId, newMask);
        return this;
    }
}

// Utility functions
export namespace EnhancedGlobalFamilyUtils {
    export function createQuery(): ContextQueryBuilder {
        return new ContextQueryBuilder();
    }

    export function createBitmask(contexts: Partial<Record<ContextType, number>>): UnifiedBitmask {
        return UnifiedBitmask.fromPlainObject(contexts as Record<string, number>);
    }
}

// Re-export for convenience
export { UnifiedBitmask, UnifiedBitmaskBuilder } from './UnifiedBitmask';
export type { ContextId, ContextMask, ContextMaskMap } from './UnifiedBitmask';
```

## 🔄 Phase 2: ECS Integration

Add these methods to your existing `ECS.ts` class:

```typescript
// Add to existing ECS class - Multi-context query methods

// #region MULTI-CONTEXT QUERIES
/**
 * Multi-context query - the power feature for complex entity filtering!
 * @param contextQueries Object mapping context names to required component masks
 * @returns Array of entity IDs matching ALL specified requirements across ALL contexts
 */
multiContextQuery(contextQueries: Record<string, number>): number[] {
    return this.getAllEntity().filter(entityId => {
        return Object.entries(contextQueries).every(([contextFamily, mask]) => {
            return this.hasComponentsInContextFamily(entityId, contextFamily as keyof F, mask);
        });
    });
}

/**
 * Check if an entity has all required components in a specific context family
 * @private
 */
private hasComponentsInContextFamily<K extends keyof F>(
    entityId: number, 
    familyName: K, 
    requiredMask: number
): boolean {
    const family = this.components.get(familyName);
    if (!family) return requiredMask === 0;
    
    let entityMask = 0;
    
    // Build the entity's component mask for this family
    family.forEach((componentSet, componentKey) => {
        if (componentSet.hasItem(entityId)) {
            entityMask |= componentKey as number;
        }
    });
    
    // Check if entity has ALL required components
    return (entityMask & requiredMask) === requiredMask;
}

/**
 * Create a context query builder for fluent API
 */
createQuery(): ContextQueryBuilder {
    return new ContextQueryBuilder();
}

/**
 * Multi-context query with ANY logic (entity needs ANY of the specified components)
 */
multiContextQueryAny(contextQueries: Record<string, number>): number[] {
    return this.getAllEntity().filter(entityId => {
        return Object.entries(contextQueries).some(([contextFamily, mask]) => {
            return this.hasAnyComponentsInContextFamily(entityId, contextFamily as keyof F, mask);
        });
    });
}

/**
 * Check if an entity has ANY of the required components in a context family
 * @private
 */
private hasAnyComponentsInContextFamily<K extends keyof F>(
    entityId: number, 
    familyName: K, 
    requiredMask: number
): boolean {
    const family = this.components.get(familyName);
    if (!family) return false;
    
    let entityMask = 0;
    
    family.forEach((componentSet, componentKey) => {
        if (componentSet.hasItem(entityId)) {
            entityMask |= componentKey as number;
        }
    });
    
    // Check if entity has ANY of the required components
    return (entityMask & requiredMask) !== 0;
}
// #endregion
```

## 🎮 Phase 3: Usage Examples

### Basic Usage Migration

**Before (Current System):**
```typescript
// Separate family approach
ecs.addComponent(entityId, 'Transform', TransformMask.Position, {x: 10, y: 20});
ecs.addComponent(entityId, 'Core', CoreMask.Renderable, {visible: true});

// Simple queries
const renderableEntities = ecs.getAllEntitiesWithComponent('Core', CoreMask.Renderable);
```

**After (Multi-Context System):**
```typescript
// Unified context approach  
ecs.addComponent(entityId, 'CoreContext', CoreMask.Position, {x: 10, y: 20});
ecs.addComponent(entityId, 'CoreContext', CoreMask.Renderable, {visible: true});

// Powerful multi-context queries
const movableRenderables = ecs.multiContextQuery({
    CoreContext: CoreMask.Position | CoreMask.Renderable,
    PhysicsContext: PhysicsMask.Velocity
});
```

### Dungeon Crawler Examples

```typescript
// Example 1: Find all combatants in range
const combatantsInRange = ecs.multiContextQuery({
    CoreContext: CoreMask.Position,
    CombatContext: CombatMask.Health | CombatMask.AttackPower
});

// Example 2: Find poisoned enemies with AI
const poisonedEnemies = ecs.multiContextQuery({
    CoreContext: CoreMask.Position,
    CombatContext: CombatMask.Health,
    StatusContext: StatusMask.Poisoned,
    AIContext: AIMask.CombatAI
});

// Example 3: Find spell casters with mana
const activeCasters = ecs.multiContextQuery({
    CoreContext: CoreMask.Position | CoreMask.Active,
    MagicContext: MagicMask.SpellCaster | MagicMask.Mana,
    CombatContext: CombatMask.Health // Must be alive
});

// Example 4: Find lootable containers
const lootableContainers = ecs.multiContextQuery({
    CoreContext: CoreMask.Position,
    InventoryContext: InventoryMask.Container,
    EnvironmentContext: EnvironmentMask.Interactable
});

// Example 5: Complex query with builder pattern
const burningMeleeWarriors = ecs.createQuery()
    .withCore(CoreMask.Position, CoreMask.Active)
    .withCombat(CombatMask.Health, CombatMask.WeaponSlot)
    .withStatus(StatusMask.Burning)
    .withAI(AIMask.AggressiveAI)
    .build();

const entities = ecs.multiContextQuery(burningMeleeWarriors.toPlainObject());
```

### System Integration

```typescript
class CombatSystem extends System {
    constructor(private ecs: ECS) {
        super();
    }

    update(deltaTime: number) {
        // Process combat between entities
        const combatants = this.ecs.multiContextQuery({
            CoreContext: CoreMask.Position | CoreMask.Active,
            CombatContext: CombatMask.Health | CombatMask.AttackPower
        });

        // Process status effects
        const statusEffectedEntities = this.ecs.multiContextQuery({
            CoreContext: CoreMask.Active,
            CombatContext: CombatMask.Health,
            StatusContext: StatusMask.Poisoned | StatusMask.Burning | StatusMask.Bleeding
        });

        // Handle regeneration
        const regeneratingEntities = this.ecs.multiContextQuery({
            CombatContext: CombatMask.Health | CombatMask.Regeneration
        });

        // Your combat logic here...
    }
}

class MagicSystem extends System {
    constructor(private ecs: ECS) {
        super();
    }

    update(deltaTime: number) {
        // Process spell casting
        const spellCasters = this.ecs.multiContextQuery({
            CoreContext: CoreMask.Position | CoreMask.Active,
            MagicContext: MagicMask.SpellCaster | MagicMask.Mana,
            CombatContext: CombatMask.Health // Must be alive
        });

        // Process active spell effects
        const spellEffects = this.ecs.multiContextQuery({
            CoreContext: CoreMask.Position,
            MagicContext: MagicMask.SpellEffect
        });

        // Handle mana regeneration
        const manaRegenEntities = this.ecs.multiContextQuery({
            MagicContext: MagicMask.Mana | MagicMask.ManaRegeneration
        });

        // Your magic system logic here...
    }
}
```

## 📈 Phase 4: Performance Optimizations

### Query Caching

```typescript
// Add to ECS class for performance
class ECS {
    private queryCache = new Map<string, number[]>();
    private cacheInvalidation = new Set<string>();
    
    /**
     * Cached version of multi-context query for frequently used queries
     */
    cachedMultiContextQuery(contextQueries: Record<string, number>): number[] {
        const cacheKey = JSON.stringify(contextQueries);
        
        if (this.queryCache.has(cacheKey) && !this.cacheInvalidation.has(cacheKey)) {
            return this.queryCache.get(cacheKey)!;
        }
        
        const result = this.multiContextQuery(contextQueries);
        this.queryCache.set(cacheKey, result);
        this.cacheInvalidation.delete(cacheKey);
        
        return result;
    }

    /**
     * Invalidate query cache when components are added/removed
     * Call this in addComponent and removeComponent methods
     */
    private invalidateQueryCache(): void {
        this.cacheInvalidation.clear();
        this.queryCache.forEach((_, key) => {
            this.cacheInvalidation.add(key);
        });
    }
}
```

### Specialized Query Methods

```typescript
// Add convenience methods for common dungeon crawler patterns
class ECS {
    /**
     * Find all living entities (have health > 0)
     */
    getLivingEntities(): number[] {
        return this.multiContextQuery({
            CombatContext: CombatMask.Health
        }).filter(entityId => {
            const health = this.getComponent(entityId, 'CombatContext', CombatMask.Health);
            return health && health.current > 0;
        });
    }

    /**
     * Find all entities in a specific area
     */
    getEntitiesInArea(center: {x: number, y: number}, radius: number): number[] {
        return this.multiContextQuery({
            CoreContext: CoreMask.Position
        }).filter(entityId => {
            const pos = this.getComponent(entityId, 'CoreContext', CoreMask.Position);
            if (!pos) return false;
            
            const dx = pos.x - center.x;
            const dy = pos.y - center.y;
            return Math.sqrt(dx * dx + dy * dy) <= radius;
        });
    }

    /**
     * Find all hostile AI entities
     */
    getHostileEntities(): number[] {
        return this.multiContextQuery({
            AIContext: AIMask.CombatAI | AIMask.AggressiveAI,
            CombatContext: CombatMask.Health
        });
    }
}
```

## ✅ Migration Checklist

### Phase 1: Foundation ✅
- [ ] Create `UnifiedBitmask.ts`
- [ ] Create `ContextMasks.ts` 
- [ ] Create `EnhancedGlobalFamilyType.ts`
- [ ] Test UnifiedBitmask independently

### Phase 2: ECS Integration ✅  
- [ ] Add multi-context query methods to ECS class
- [ ] Add query builder integration
- [ ] Test with existing simple queries

### Phase 3: Migration ✅
- [ ] Gradually migrate components to new context system
- [ ] Update existing systems to use multi-context queries
- [ ] Add new game-specific contexts (Combat, Magic, etc.)

### Phase 4: Optimization ✅
- [ ] Add query caching system
- [ ] Add specialized query methods
- [ ] Performance testing with 1M entities

### Phase 5: Advanced Features ✅
- [ ] Add context-specific system families
- [ ] Add modding support for custom contexts
- [ ] Add debugging and profiling tools

## 🚀 Expected Benefits

### Immediate Benefits:
- **Backward Compatibility**: Existing code continues to work
- **Unlimited Scalability**: 256+ contexts × 32 bits each
- **Clean Architecture**: Domain separation (Physics ≠ Combat ≠ Magic)

### Long-term Benefits:
- **Complex Queries**: `particle & movable & burning & hasAI` in one operation
- **Performance**: Bitwise operations remain ultra-fast
- **Modularity**: Easy to add/remove entire gameplay systems
- **Extensibility**: Perfect for modding and DLC content

### Dungeon Crawler Specific:
- **Rich Status Systems**: Unlimited buffs, debuffs, conditions
- **Complex AI**: Sophisticated behavior combinations
- **Deep Itemization**: Rich equipment and crafting systems
- **Environmental Interaction**: Complex world objects

## 🔍 Testing Strategy

### Unit Tests
```typescript
// Test multi-context queries
describe('Multi-Context Queries', () => {
    it('should find entities with multiple context requirements', () => {
        const ecs = new ECS();
        const entityId = ecs.createEntity();
        
        ecs.addComponent(entityId, 'CoreContext', CoreMask.Position, {x: 10, y: 20});
        ecs.addComponent(entityId, 'CombatContext', CombatMask.Health, {current: 100, max: 100});
        
        const results = ecs.multiContextQuery({
            CoreContext: CoreMask.Position,
            CombatContext: CombatMask.Health
        });
        
        expect(results).toContain(entityId);
    });
});
```

### Performance Tests
```typescript
// Test with 1M entities
describe('Performance Tests', () => {
    it('should handle 1M entities efficiently', () => {
        const ecs = new ECS(1000000);
        
        // Create 1M entities with various components
        for (let i = 0; i < 1000000; i++) {
            const entityId = ecs.createEntity();
            ecs.addComponent(entityId, 'CoreContext', CoreMask.Position, {x: i, y: i});
            
            if (i % 2 === 0) {
                ecs.addComponent(entityId, 'CombatContext', CombatMask.Health, {current: 100, max: 100});
            }
            
            if (i % 3 === 0) {
                ecs.addComponent(entityId, 'PhysicsContext', PhysicsMask.Velocity, {x: 1, y: 1});
            }
        }
        
        const startTime = performance.now();
        const results = ecs.multiContextQuery({
            CoreContext: CoreMask.Position,
            CombatContext: CombatMask.Health,
            PhysicsContext: PhysicsMask.Velocity
        });
        const endTime = performance.now();
        
        console.log(`Query took ${endTime - startTime} milliseconds`);
        console.log(`Found ${results.length} matching entities`);
        
        expect(endTime - startTime).toBeLessThan(100); // Should be under 100ms
    });
});
```

## 🎯 Context System Overview

### 8 Predefined Contexts (32 bits each):

1. **CoreMask**: Position, Rotation, Scale, Renderable, HtmlElement, Visible, Active, etc.
2. **PhysicsMask**: Velocity, Mass, RigidBody, Collider, Gravity, Friction, etc.
3. **CombatMask**: Health, Damage, Armor, WeaponSlot, Shield, AttackPower, etc.
4. **MagicMask**: SpellCaster, Mana, SpellEffect, MagicResistance, Enchanted, etc.
5. **StatusMask**: Poisoned, Burning, Frozen, Stunned, Invisible, Haste, etc.
6. **AIMask**: BehaviorTree, Pathfinding, CombatAI, PatrolAI, ChaseAI, etc.
7. **InventoryMask**: Container, Equippable, Consumable, Weapon, Armor, etc.
8. **EnvironmentMask**: Door, Chest, Trap, Treasure, Interactable, etc.

## 🚀 Final Notes

This multi-context bitmask system transforms your ECS from a simple component manager into a powerful game development platform capable of handling the most complex gameplay scenarios while maintaining the performance characteristics that make ECS architectures so effective.

The beauty is **gradual migration** - your existing code continues working while you add these powerful new capabilities!

### Key Advantages:

- **256+ contexts** × 32 bits each = unlimited scalability
- **Backward compatibility** - existing code works unchanged
- **Domain separation** - clean modular architecture
- **Complex queries** like `particle & movable & burning & hasAI`
- **Performance** - bitwise operations remain ultra-fast
- **Modularity** - easy to add/remove entire gameplay systems
- **Extensibility** - perfect for modding and DLC

This system is designed specifically for the kind of complex, multi-layered gameplay you'll need for dungeon crawlers and other sophisticated game genres.