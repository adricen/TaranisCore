import { RenderSystem } from "@/core/systems";
import {cellSize, cellRow, cellCol} from '@/ticTactToe/constantes';
import { Position, Renderable } from "@/core/components";
import type { ECS } from "@/core/ECS-old";

class RenderSystemTicTacToe extends RenderSystem {

    public update(ecs: ECS) {
        // clear and redraw the grid
        this.drawGrid();

        // Draw entities
        const entities = ecs.getEntitiesWithComponents([Position, Renderable]);
        entities.forEach((entity) => {
            // Both components are available since
            // getEntitiesWithComponents return entity with both components
            const {x, y} = entity.components.get('Position')!;
            const {symbol, color} = entity.components.get('Renderable')!;

            if (symbol.length > 0) {
                this.canvasManager.ctx.fillStyle = color;
                this.canvasManager.ctx.fillText(symbol, x, y);
            }
        });
    }

    /**
     * Draw the Tic Tac Toe grid on the canvas.
     * Specific to Tic Tac Toe
     */
    private drawGrid() {
        // draw grid
        this.canvasManager.ctx.strokeStyle = this.canvasManager.styleCtx?.strokeStyle as string ?? '#333';
        this.canvasManager.ctx.fillStyle = this.canvasManager.styleCtx?.fillStyle as string ?? '#1ccc6b62';
        this.canvasManager.ctx.lineWidth = this.canvasManager.styleCtx?.lineWidth as number ?? 2;
        for (let i = 0; i <= cellCol; i++) {
            this.canvasManager.ctx.beginPath();
            this.canvasManager.ctx.moveTo(i * cellSize, 0);
            this.canvasManager.ctx.lineTo(i * cellSize, cellRow * cellSize);
            this.canvasManager.ctx.stroke();

            this.canvasManager.ctx.beginPath();
            this.canvasManager.ctx.moveTo(0, i * cellSize);
            this.canvasManager.ctx.lineTo(cellCol * cellSize, i * cellSize);
            this.canvasManager.ctx.stroke();
            this.canvasManager.ctx.fill()

            // fill background
            for(let j = 0; j < cellRow; j++) {
                this.canvasManager.ctx.fillRect(i * cellSize + 1, j * cellSize + 1, cellSize - 2, cellSize - 2);
            }


        }
    }
}

export { RenderSystemTicTacToe };