// Main entry point for RASTERDRIVE

import { PixelCamera } from './render/PixelCamera';
import { GameEngine } from './core/GameEngine';
import { WellRenderer } from './render/WellRenderer';
import { QueueHoldRenderer } from './render/QueueHoldRenderer';
import { JunkRenderer } from './render/JunkRenderer';
import { VFX } from './render/VFX';
import { HUD } from './ui/HUD';

class Game {
  private camera: PixelCamera;
  private engine: GameEngine;
  private wellRenderer: WellRenderer;
  private queueHoldRenderer: QueueHoldRenderer;
  private junkRenderer: JunkRenderer;
  private vfx: VFX;
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
    this.junkRenderer = new JunkRenderer();
    this.vfx = new VFX();
    this.hud = new HUD();

    // Add to stage (VFX on top for effects)
    this.camera.stage.addChild(this.wellRenderer.getContainer());
    this.camera.stage.addChild(this.queueHoldRenderer.getContainer());
    this.camera.stage.addChild(this.junkRenderer.getContainer());
    this.camera.stage.addChild(this.hud.getContainer());
    this.camera.stage.addChild(this.vfx.getContainer()); // VFX on top

    // Listen to game events
    this.engine.on((event) => {
      console.log('Game event:', event);
      this.handleGameEvent(event);
    });
  }

  private handleGameEvent(event: any): void {
    const wellX = 100;
    const wellY = 20;

    switch (event.type) {
      case 'line_clear':
        // Get line positions from game state
        const lines = this.engine.getWell().getFilledLines();
        if (lines.length > 0) {
          this.vfx.lineClearFlash(lines, wellX, wellY);
        }
        break;

      case 'prime_clear':
        this.vfx.primeClearEffect(wellX, wellY);
        break;

      case 'perfect_clear':
        this.vfx.perfectClearEffect(wellX, wellY);
        break;

      case 'piece_lock':
        // Lock effect at piece position
        const currentPiece = this.engine.getState().currentPiece;
        if (currentPiece) {
          const lockX = wellX + currentPiece.x * 8;
          const lockY = wellY + currentPiece.y * 8;
          this.vfx.pieceLockImpact(lockX, lockY, 0x00e0ff);
        }
        break;
    }
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

    // Update VFX
    this.vfx.update(dt);

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

    // Render junk forecast
    this.junkRenderer.render(
      state.junkForecast,
      state.junkTimer,
      state.junkTimerMax
    );

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
    this.junkRenderer.destroy();
    this.vfx.destroy();
    this.hud.destroy();
    this.camera.destroy();
  }
}

// Start game
const game = new Game();
game.init().catch(console.error);

// Debug access
(window as any).game = game;
