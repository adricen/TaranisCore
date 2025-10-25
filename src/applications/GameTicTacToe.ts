
import { Clickable, Position, Renderable } from '@/core/components';
import { GameManager, CanvasManager } from '@/core/managers';
import { ECS } from '@/core/ECS-old'
import { ClickSystemTicTacToe, RenderSystemTicTacToe } from '@/ticTactToe/systems';
import { cellCol, cellRow, cellSize } from '@/ticTactToe/constantes';
import type { ICanvasInitParams } from '@/core/components';

class GameTicTacToe extends GameManager {
    // Using this class to deal with my canvas and ecs core
    constructor(canvasParam: ICanvasInitParams) {
        super(new ECS());
        
        // Init Game systems
        this.ecs.addSystem(new RenderSystemTicTacToe(this.canvasManager));
        this.ecs.addSystem(new ClickSystemTicTacToe(this.ecs, this.canvasManager)); // dt = 0 car tour par tour

        // provisoire
        this.initBoard();
        // this.debugEntityByCellsAndRow();
    }

    private initBoard() {
        for (let x = 0; x < cellCol; x++) {
            for (let y = 0; y < cellRow; y++) {
                const entityId = this.ecs.createEntity();
                this.ecs.addComponent(entityId, Position, { 
                    x: x * cellSize + cellSize / 2,
                    y: y * cellSize + cellSize / 2
                });
                this.ecs.addComponent(entityId, Renderable, {symbol: "", color: "white"});
                this.ecs.addComponent(entityId, Clickable, {onClick: () => {
                    console.log(`Cell clicked: `, this);
                }});
            }
        }
    }

    debugEntityByCellsAndRow() {
        console.group('entity : ')
        this.ecs.getEntitiesWithComponents([Position]).forEach(entity => {
            const pos = entity.components.get('Position')!;
            console.log(`Entity at cell: ${pos.x}, ${pos.y}`);
        });
        console.groupEnd();
    }
}

export { GameTicTacToe };
