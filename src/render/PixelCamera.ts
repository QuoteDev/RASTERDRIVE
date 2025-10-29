// PixelCamera - ensures pixel-perfect rendering with integer scaling

import * as PIXI from 'pixi.js';
import { snap } from '@/utils/math';

export interface PixelCameraConfig {
  internalWidth: number;
  internalHeight: number;
  backgroundColor: number;
}

export class PixelCamera {
  public app!: PIXI.Application;
  public stage: PIXI.Container;
  public renderTexture: PIXI.RenderTexture;
  public renderSprite: PIXI.Sprite;

  private config: PixelCameraConfig;
  private scale: number = 1;

  constructor(config: PixelCameraConfig) {
    this.config = config;

    // Main stage - this is where we render at internal resolution
    this.stage = new PIXI.Container();

    // Create render texture at internal resolution
    this.renderTexture = PIXI.RenderTexture.create({
      width: config.internalWidth,
      height: config.internalHeight,
      scaleMode: PIXI.SCALE_MODES.NEAREST,
    } as any);

    // Sprite to display the render texture
    this.renderSprite = new PIXI.Sprite(this.renderTexture);
    if (this.renderSprite.texture.baseTexture) {
      this.renderSprite.texture.baseTexture.scaleMode = PIXI.SCALE_MODES.NEAREST;
    }
  }

  async init(container: HTMLElement): Promise<void> {
    // Create application with options for PixiJS v7
    this.app = new PIXI.Application({
      backgroundColor: this.config.backgroundColor,
      antialias: false,
      resolution: 1,
      autoDensity: false,
    } as any);

    // Append canvas to container
    const view = (this.app.view as any) || this.app.renderer.view;
    container.appendChild(view);

    this.app.stage.addChild(this.renderSprite);

    this.resize();
    window.addEventListener('resize', () => this.resize());
  }

  private resize(): void {
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;

    // Calculate integer scale that fits the window
    const scaleX = Math.floor(windowWidth / this.config.internalWidth);
    const scaleY = Math.floor(windowHeight / this.config.internalHeight);
    this.scale = Math.max(1, Math.min(scaleX, scaleY));

    // Calculate output size with integer scaling
    const outputWidth = this.config.internalWidth * this.scale;
    const outputHeight = this.config.internalHeight * this.scale;

    // Set canvas size
    this.app.renderer.resize(windowWidth, windowHeight);

    // Position and scale the render sprite (centered with letterbox)
    this.renderSprite.scale.set(this.scale);
    this.renderSprite.position.set(
      snap((windowWidth - outputWidth) / 2),
      snap((windowHeight - outputHeight) / 2)
    );
  }

  render(): void {
    // Render the stage to the render texture
    this.app.renderer.render(this.stage, {
      renderTexture: this.renderTexture,
    } as any);
  }

  getScale(): number {
    return this.scale;
  }

  snapToPixel(x: number, y: number): { x: number; y: number } {
    return { x: snap(x), y: snap(y) };
  }

  destroy(): void {
    window.removeEventListener('resize', () => this.resize());
    this.app.destroy(true);
  }
}
