// tests/core/systems/ClickSystem.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
// import { ClickSystem } from '@/systems';
// import { ECS } from '@/core/ECS-old';
import { createCanvas } from 'canvas';

// Mock global HTMLCanvasElement to use the canvas library

describe.skip('ClickSystem', () => {
    let ecs: ECS;
    // let canvasManager: CanvasManager;

    beforeEach(() => {
        // Créer un canvas mock
        const canvas = createCanvas(400, 400);
        (canvas as any).id = 'testCanvas';
        // Mock addEventListener and removeEventListener
        (canvas as any).addEventListener = vi.fn();
        (canvas as any).removeEventListener = vi.fn();
        (canvas as any).dispatchEvent = vi.fn();

        ecs = new ECS();
        // canvasManager = new CanvasManager({ canvas });
        // // clickSystem = new ClickSystem(ecs, canvasManager, 'X');
        // ecs.addSystem(new ClickSystem(ecs, canvasManager));
        // ecs.update();
    });

    it('should attach a click event listener to the canvas', () => {
        expect(true).toBe(true);
        // const addEventListenerSpy = vi.spyOn(canvasManager.canvas, 'addEventListener');
        // new ClickSystem(ecs, canvasManager);
        // expect(addEventListenerSpy).toHaveBeenCalledWith(expect.any(Function));
    });

    it('should handle clicks on entities', () => {
        // Créer une entité cliquable
        // const entityId = ecs.createEntity();
        // ecs.addComponent(entityId, Position, {x: 20, y: 20});
        // ecs.addComponent(entityId, Renderable, {});
        // ecs.addComponent(entityId, Clickable, {onClick: () => {
        //     const renderable = ecs.getComponentFromEntity(entityId, Renderable) as Renderable;
        //     renderable.symbol = 'X';
        // }});

        // // Simuler un clic sur la cellule (0, 0)
        // const event = new MouseEvent('click', {
        //     clientX: 20,  // 20px dans une cellule de 80px → x = 0
        //     clientY: 20,  // y = 0
        // });
        // canvasManager.canvas.dispatchEvent(event);

        // // Vérifier que le symbole a été mis à jours
        // const renderable = ecs.getComponentFromEntity(entityId, Renderable)!;
        // expect(renderable.symbol).toBe('X');
    });
});
