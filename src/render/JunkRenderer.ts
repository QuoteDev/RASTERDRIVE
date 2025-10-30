// Junk renderer - Shows forecast ribbon with timer

import * as PIXI from 'pixi.js';
import { JunkCard } from '@/types/game';
import { snap } from '@/utils/math';
import { PixelUI } from './PixelUI';
import { BitmapFont } from './BitmapFont';

export class JunkRenderer {
  private container: PIXI.Container;
  private graphics: PIXI.Graphics;

  constructor() {
    this.container = new PIXI.Container();
    this.graphics = new PIXI.Graphics();
    this.container.addChild(this.graphics);

    // Position above the well
    this.container.x = snap(100);
    this.container.y = snap(4);
  }

  render(forecast: JunkCard[], timer: number, timerMax: number): void {
    this.graphics.clear();

    const ribbonWidth = 84; // Match well width
    const ribbonHeight = 12;

    // Background ribbon
    PixelUI.drawPanel(
      this.graphics,
      0,
      0,
      ribbonWidth,
      ribbonHeight,
      0x161a1e,
      0x243042
    );

    // Draw timer bar
    const timerProgress = timer / timerMax;
    const isPanic = timer < 2.0; // Panic mode under 2 seconds

    // Timer fill
    const fillWidth = Math.floor((ribbonWidth - 4) * (1 - timerProgress));
    const timerColor = isPanic ? 0xff4d2e : 0x00e0ff; // Vermilion in panic, cyan normal

    if (fillWidth > 0) {
      this.graphics.beginFill(timerColor, isPanic ? 0.8 : 0.5);
      this.graphics.drawRect(2, 2, fillWidth, ribbonHeight - 4);
      this.graphics.endFill();

      // Pulse effect in panic mode
      if (isPanic && Math.floor(timer * 8) % 2 === 0) {
        PixelUI.drawPulse(
          this.graphics,
          2,
          2,
          fillWidth,
          ribbonHeight - 4,
          0xff4d2e,
          0.8
        );
      }
    }

    // Draw forecast cards (3 cards visible)
    const displayCount = Math.min(3, forecast.length);
    for (let i = 0; i < displayCount; i++) {
      const card = forecast[i];
      const cardX = ribbonWidth + 6 + i * 30;
      this.drawForecastCard(card, cardX, 0, i === 0); // First card highlighted
    }

    // Draw timer text
    const timerText = timer.toFixed(1);
    BitmapFont.drawText(
      this.graphics,
      timerText,
      ribbonWidth - BitmapFont.measureText(timerText) - 2,
      3,
      isPanic ? 0xff4d2e : 0xe6f2ff
    );
  }

  private drawForecastCard(
    card: JunkCard,
    x: number,
    y: number,
    isActive: boolean
  ): void {
    const cardWidth = 26;
    const cardHeight = 12;

    // Card background
    const bgColor = isActive ? 0x2a323a : 0x161a1e;
    PixelUI.drawFrame(
      this.graphics,
      x,
      y,
      cardWidth,
      cardHeight,
      bgColor,
      isActive ? 0x00e0ff : 0x243042,
      0x161a1e
    );

    // Card name (abbreviated)
    const name = card.name.substring(0, 6).toUpperCase();
    BitmapFont.drawText(
      this.graphics,
      name,
      x + 2,
      y + 3,
      isActive ? 0x00e0ff : 0x9bb7ff
    );
  }

  // Animate card deletion (called when Prime clear happens)
  animateCardDelete(onComplete: () => void): void {
    // Create a "tear" effect - flash and slide out
    const flashGraphics = new PIXI.Graphics();
    flashGraphics.beginFill(0x00e0ff, 0.6);
    flashGraphics.drawRect(0, 0, 84, 12);
    flashGraphics.endFill();

    this.container.addChild(flashGraphics);

    // Fade out quickly
    let alpha = 0.6;
    const fadeInterval = setInterval(() => {
      alpha -= 0.15;
      flashGraphics.alpha = alpha;
      if (alpha <= 0) {
        clearInterval(fadeInterval);
        this.container.removeChild(flashGraphics);
        onComplete();
      }
    }, 30);
  }

  getContainer(): PIXI.Container {
    return this.container;
  }

  destroy(): void {
    this.container.destroy({ children: true });
  }
}
