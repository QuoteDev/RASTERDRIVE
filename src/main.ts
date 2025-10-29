// Main entry point for RASTERDRIVE

import { PixelCamera } from './render/PixelCamera';
import { GameEngine } from './core/GameEngine';
import { WellRenderer } from './render/WellRenderer';
import { QueueHoldRenderer } from './render/QueueHoldRenderer';
import { HUD } from './ui/HUD';

class Game {
  private camera: PixelCamera;
  private engine: GameEngine;
  private wellRenderer: WellRenderer;
  private queueHoldRenderer: QueueHoldRenderer;
  private hud: HUD;

  private lastTime: number = 0;
  private running: boolean = false;

  constructor() {
    // Create pixel camera with internal resolution
    this.camera = new PixelCamera({
      internalWidth: 384,
      internalHeight: 216,
      backgroundColor: 0x0f1317,
    });

    // Create game engine
    const seed = Date.now();
    this.engine = new GameEngine(seed);

    // Create renderers
    this.wellRenderer = new WellRenderer(10, 20);
    this.queueHoldRenderer = new QueueHoldRenderer();
    this.hud = new HUD();

    // Add to stage
    this.camera.stage.addChild(this.wellRenderer.getContainer());
    this.camera.stage.addChild(this.queueHoldRenderer.getContainer());
    this.camera.stage.addChild(this.hud.getContainer());

    // Listen to game events
    this.engine.on((event) => {
      console.log('Game event:', event);
    });
  }

  async init(): Promise<void> {
    const app = document.getElementById('app');
    if (!app) throw new Error('App container not found');

    await this.camera.init(app);

    // Start game loop
    this.running = true;
    this.lastTime = performance.now();
    requestAnimationFrame((time) => this.loop(time));

    console.log('RASTERDRIVE initialized');
    console.log('Controls:');
    console.log('  Arrow Keys: Move/Rotate');
    console.log('  Space: Hard Drop');
    console.log('  C: Hold');
    console.log('  Z: Rotate CCW');
  }

  private loop(time: number): void {
    if (!this.running) return;

    const dt = Math.min((time - this.lastTime) / 1000, 0.1); // Cap at 100ms
    this.lastTime = time;

    // Update game
    this.engine.update(dt);

    // Render
    this.render();

    // Next frame
    requestAnimationFrame((t) => this.loop(t));
  }

  private render(): void {
    const state = this.engine.getState();

    // Render well and pieces
    this.wellRenderer.render(state.board, state.currentPiece);

    // Render queue and hold
    this.queueHoldRenderer.render(state.queue, state.held);

    // Update HUD
    this.hud.update(state);

    // Render to screen
    this.camera.render();
  }

  destroy(): void {
    this.running = false;
    this.engine.destroy();
    this.wellRenderer.destroy();
    this.queueHoldRenderer.destroy();
    this.hud.destroy();
    this.camera.destroy();
  }
}

// Start game
const game = new Game();
game.init().catch(console.error);

// Debug access
(window as any).game = game;
