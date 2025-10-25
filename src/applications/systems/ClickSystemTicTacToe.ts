import { cellSize } from "@/ticTactToe/constantes";
import { ClickSystem } from "@/core/systems/ClickSystem";
import { Clickable, Position } from "@/core/components";
import type { ECS } from "@/core/ECS-old";
import type { CanvasManager } from "@/core/managers/CanvasManager";
import type { IEntity } from "@/core/components";

// TODO: test this file
class ClickSystemTicTacToe extends ClickSystem {
    private currentPlayer: 'X' | 'O';

    constructor(ecs: ECS, canvasManager: CanvasManager, currentPlayer: 'X' | 'O' = 'X') {
        super(ecs, canvasManager);
        this.currentPlayer = currentPlayer;
    }

    setupClickHandler() {
        this.canvasManager.canvas.onclick = (event) => {
            const rect = this.canvasManager.canvas.getBoundingClientRect();
            const x = Math.floor((event.clientX - rect.left) / cellSize);
            const y = Math.floor((event.clientY - rect.top) / cellSize);
            const entities = this.ecs.getEntitiesWithComponents([Position, Clickable]);
            const entity = entities?.find(e => {
                const pos = e.components.get('Position')!;
                return pos.x === x * cellSize + cellSize / 2 && pos.y === y * cellSize + cellSize / 2;
            });

            if (entity && this.canPlaceSymbol(entity)) {
                this.placeSymbol(entity);
                this.currentPlayer = this.currentPlayer === 'X' ? 'O' : 'X';  
                this.ecs.update(); // Update ECS to reflect changes
            }
        }
    }

    // useless for now
    update() {}

    private canPlaceSymbol(entity: IEntity): boolean {
        const renderable = entity.components.get('Renderable');
        if (!renderable) return false;
        return renderable.symbol === '';  // Vérifie si la cellule est vide
    }

    private placeSymbol(entity: IEntity): void {
        const renderable = entity.components.get('Renderable');
        if (!renderable) return;
        renderable.symbol = this.currentPlayer;  // Place 'X' ou 'O'
        renderable.color = this.currentPlayer === 'X' ? '#FF5733' : '#3357FF';  // Couleur spécifique
    }

    dispose() {
        this.canvasManager.canvas.onclick = null;
        this.canvasManager = null!;
    }
}

export { ClickSystemTicTacToe };