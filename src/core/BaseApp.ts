import { ECS } from "./ECS";
import { Canvas2DFactory } from "@/core/factories/Canvas2DFactory";
import { Mouse2DFactory } from "@/core/factories/Mouse2DFactory";
import { Canvas2DSystem } from "@/core/systems/Canvas2DSystem";
import { Mouse2DSystem } from "@/core/systems/Mouse2DSystem";


abstract class BaseApp {
    protected ecs: ECS;
    // TODO: add app param to get system on start
    constructor(canvasRef: HTMLCanvasElement /* AppParamsInit */) {
        this.ecs = new ECS();

        Canvas2DFactory(this.ecs, canvasRef);
        Mouse2DFactory(this.ecs);
        
        const canvasSystem = new Canvas2DSystem(this.ecs)
        const mouseSystem = new Mouse2DSystem(this.ecs)
        this.ecs.addSystem(canvasSystem);
        this.ecs.addSystem(mouseSystem);
    }

    start(): void {
        this.renderLoop();
    }

    renderLoop(): void {
        this.ecs.updateSystems(0);
        // Check la render loop speed
        requestAnimationFrame(() => this.renderLoop());
    }
//     private lastFrameTime: number = 0; // For delta time calculation

//     constructor( canvas: HTMLCanvasElement, IAppParams: TAppInitParams) {
//         const {
//             addEventSystem = true,
//             addEventLogDebugger = false,
//             add2DCanvasSystem = true,
//             addMouseSystem = true,
//             addRenderSystem = true,
//         } = IAppParams || {};
//         // Puppet maseter
//         this.ecs = new ECS();
        
//         if (addEventSystem) {
//             this.ecs.addSystem(new EventSystem());
//         }
//         if (addEventSystem && addEventLogDebugger) {
//             EventLoggerFactory(this.ecs);
//         }
//         if (add2DCanvasSystem) {
//             Canvas2DFactory(this.ecs, IAppParams?.dimension);
//             this.ecs.addSystem(new CanvasLinkSystem(this.ecs, canvas));
//         }
        
//         if (addMouseSystem) {
//             MouseFactory(this.ecs);
//             this.ecs.addSystem(new MousePositionSystem(this.ecs))
//             this.ecs.addSystem(new MouseClickSystem(this.ecs));
//         }

//         if (addRenderSystem) {
//             this.ecs.addSystem(new RenderSystem(this.ecs));
//         }
//         /**
//          * A faire
//          */
//         // - StateSystem
//         // - DebuggingToolsSystem
//         // - TimerSystem
//         // - AnimationSystem
        
//         /**
//          * A regader - peut-être faire
//          */
//         // - ParticleSystem
//         // - KeyboardInputSystem
        
//         /**
//          * Peut-être faire un jour
//          */
//         // - CameraSystem
//         // - AISystem
//         // - DebugSystem
//         // - SoundSystem
//         // - AudioSystem
//         // - MusicSystem
//         // - DynamicEntitySystem
//         // - PhysicsSystem
//         // - CollisionSystem
//         // - AnalyticsSystem
//         // - NetworkSystem
//         // - InventorySystem
//         // - QuestSystem
//         // - DialogueSystem
//         // - SaveLoadSystem
//         // - AchievementSystem
//         // - SocialSystem
//         // - EconomySystem
//         // - CraftingSystem
//         // - WeatherSystem
//         // - DayNightCycleSystem
//         // - LightingSystem
//         // - ShadowSystem
//         // - PostProcessingSystem
//         // - UI/UX System
//         // - LocalizationSystem
//         // - AccessibilitySystem
//         // - PerformanceMonitoringSystem
//         // - CTRL Z System
//     }

//     // could have a renderloop here
//     // Take better control of one render frame - seams to be too fast with requestAnimationFrame
//     startRenderLoop = (currentTime: number = performance.now()): void => {
//         const deltaTime = ((currentTime - this.lastFrameTime) / 1000); // Convert to seconds
//         this.lastFrameTime = currentTime;
//         // Update ECS with deltaTime
//         this.ecs.update(deltaTime);
//         // canvas render loop ?
//         requestAnimationFrame(this.startRenderLoop);
//     }
}

export { BaseApp };