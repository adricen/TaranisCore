# Simple Multi-Context ECS - The Easy Way

## 🎯 Goal: Keep It Simple, Make It Powerful

Instead of complex `UnifiedBitmask`, let's just add **one method** to your existing ECS that lets you query across multiple families.

## 🔧 The Simple Addition

Add this **single method** to your existing `ECS.ts`:

```typescript
/**
 * Multi-family query - Find entities that have components in ALL specified families
 * @param familyRequirements Object mapping family names to required component masks
 * @returns Array of entity IDs matching ALL requirements
 * 
 * @example
 * // Find entities with Position in Transform family AND Health in Combat family
 * const combatants = ecs.queryAcrossFamilies({
 *     Transform: TransformMask.Position,
 *     Combat: CombatMask.Health | CombatMask.AttackPower
 * });
 */
queryAcrossFamilies(familyRequirements: Record<string, number>): number[] {
    return this.getAllEntity().filter(entityId => {
        // Check if entity has ALL required components in ALL specified families
        return Object.entries(familyRequirements).every(([familyName, requiredMask]) => {
            const family = this.components.get(familyName as keyof F);
            if (!family) return requiredMask === 0;
            
            let entityMask = 0;
            
            // Build entity's component mask for this family
            family.forEach((componentSet, componentKey) => {
                if (componentSet.hasItem(entityId)) {
                    entityMask |= componentKey as number;
                }
            });
            
            // Check if entity has ALL required components in this family
            return (entityMask & requiredMask) === requiredMask;
        });
    });
}
```

## 🎮 Usage Examples

### Current Simple Usage (Still Works!)
```typescript
// Your existing code works exactly the same
const positioned = ecs.getAllEntitiesWithComponent('Transform', TransformMask.Position);
const renderable = ecs.getAllEntitiesWithComponent('Core', CoreMask.Renderable);
```

### New Multi-Family Queries (When You Need Them!)
```typescript
// Find entities with position AND health (across families)
const livingPositioned = ecs.queryAcrossFamilies({
    Transform: TransformMask.Position,
    Combat: CombatMask.Health
});

// Find interactive game objects
const interactiveObjects = ecs.queryAcrossFamilies({
    Transform: TransformMask.Position,
    Core: CoreMask.Renderable,
    UI: UIMask.Clickable
});

// Find AI enemies with combat abilities
const combatEnemies = ecs.queryAcrossFamilies({
    Transform: TransformMask.Position,
    Combat: CombatMask.Health | CombatMask.AttackPower,
    AI: AIMask.CombatBehavior
});
```

## 📁 Simple File Structure

Just add these **simple mask files** alongside your existing ones:

```
src/core/bitmasks/
├── TransformMask.ts    # (existing - keep as is)
├── CoreMask.ts         # (existing - keep as is) 
├── PhysiqueMask.ts     # (existing - keep as is)
├── AiMask.ts           # (existing - keep as is)
├── CombatMask.ts       # NEW - simple enum
├── UIMask.ts           # NEW - simple enum
├── EffectsMask.ts      # NEW - simple enum (when needed)
└── GameplayMask.ts     # NEW - simple enum (when needed)
```

## 🎯 New Simple Mask Files

### CombatMask.ts
```typescript
export enum CombatMask {
    Health = 1 << 0,        // 1
    AttackPower = 1 << 1,   // 2
    Defense = 1 << 2,       // 4
    Weapon = 1 << 3,        // 8
    Armor = 1 << 4,         // 16
    Shield = 1 << 5,        // 32
    // Add more as needed...
}
```

### UIMask.ts
```typescript
export enum UIMask {
    Clickable = 1 << 0,     // 1
    Hoverable = 1 << 1,     // 2
    Draggable = 1 << 2,     // 4
    Focusable = 1 << 3,     // 8
    Tooltip = 1 << 4,       // 16
    Animation = 1 << 5,     // 32
    // Add more as needed...
}
```

### EffectsMask.ts
```typescript
export enum EffectsMask {
    Particle = 1 << 0,      // 1
    Sound = 1 << 1,         // 2
    Glow = 1 << 2,          // 4
    Shake = 1 << 3,         // 8
    Fade = 1 << 4,          // 16
    Pulse = 1 << 5,         // 32
    // Add more as needed...
}
```

## 🚀 Migration Strategy

### Phase 1: Add The Method (5 minutes)
1. Add `queryAcrossFamilies()` to your ECS class
2. Test with existing families

### Phase 2: Add New Families (As Needed)
1. Create `CombatMask.ts` when you add combat
2. Create `UIMask.ts` when you add UI interactions  
3. Create `EffectsMask.ts` when you add visual effects

### Phase 3: Use When You Need It
- Keep using simple queries for simple stuff
- Use multi-family queries only for complex scenarios

## 🎮 Practical TicTacToe Evolution

### Current TicTacToe (Works As-Is)
```typescript
// Your current code doesn't change at all!
ecs.addComponent(entityId, 'Transform', TransformMask.Position, {x: 100, y: 100});
ecs.addComponent(entityId, 'Core', CoreMask.Renderable, {symbol: "X"});

const cells = ecs.getAllEntitiesWithComponent('Transform', TransformMask.Position);
```

### Enhanced TicTacToe (When You Want More)
```typescript
// Add new families only when you need them
ecs.registerFamily('UI');
ecs.registerFamily('Gameplay');

// Add components to new families
ecs.addComponent(entityId, 'UI', UIMask.Clickable | UIMask.Hoverable, {
    onClick: () => console.log('clicked!'),
    onHover: () => console.log('hovering!')
});

ecs.addComponent(entityId, 'Gameplay', GameplayMask.TicTacToeCell, {
    owner: null,
    value: ""
});

// Now you can do complex queries when you need them
const interactiveCells = ecs.queryAcrossFamilies({
    Transform: TransformMask.Position,
    Core: CoreMask.Renderable,
    UI: UIMask.Clickable,
    Gameplay: GameplayMask.TicTacToeCell
});

// Or keep it simple for simple stuff
const justCells = ecs.getAllEntitiesWithComponent('Transform', TransformMask.Position);
```

## ✅ Benefits of This Simple Approach

### ✅ **Simple to Understand**
- One method: `queryAcrossFamilies()`
- Same patterns you already know
- No complex classes to learn

### ✅ **Backward Compatible** 
- All existing code works unchanged
- Add features incrementally
- No big refactoring needed

### ✅ **Powerful When Needed**
- Multi-family queries for complex scenarios
- Simple queries for simple scenarios
- Best of both worlds

### ✅ **Easy to Extend**
- Add new mask files when you need them
- Each family stays focused (32 bits max)
- Clean separation of concerns

## 🎯 Bottom Line

This gives you **90% of the power** with **10% of the complexity**. You can:

1. **Keep your current simple code working**
2. **Add one method for multi-family queries**  
3. **Add new families only when you need them**
4. **Never touch complex UnifiedBitmask stuff**

Does this feel much more manageable for your goals?