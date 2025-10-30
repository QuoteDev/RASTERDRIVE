// Pixel UI components - Pixel-perfect panels, borders, and widgets

import * as PIXI from 'pixi.js';
import { snap } from '@/utils/math';

export class PixelUI {
  // Draw a pixel art panel with border
  static drawPanel(
    graphics: PIXI.Graphics,
    x: number,
    y: number,
    width: number,
    height: number,
    bgColor: number = 0x121820,
    borderColor: number = 0x243042
  ): void {
    x = snap(x);
    y = snap(y);

    // Background fill
    graphics.beginFill(bgColor);
    graphics.drawRect(x, y, width, height);
    graphics.endFill();

    // Outer border (1px)
    graphics.lineStyle(1, borderColor);
    graphics.drawRect(x, y, width, height);
    graphics.lineStyle(0);
  }

  // Draw a pixel art frame (thicker border)
  static drawFrame(
    graphics: PIXI.Graphics,
    x: number,
    y: number,
    width: number,
    height: number,
    bgColor: number = 0x121820,
    borderColor: number = 0x243042,
    innerColor: number = 0x161a1e
  ): void {
    x = snap(x);
    y = snap(y);

    // Outer border
    graphics.beginFill(borderColor);
    graphics.drawRect(x, y, width, height);
    graphics.endFill();

    // Inner border
    graphics.beginFill(innerColor);
    graphics.drawRect(x + 1, y + 1, width - 2, height - 2);
    graphics.endFill();

    // Inner fill
    graphics.beginFill(bgColor);
    graphics.drawRect(x + 2, y + 2, width - 4, height - 4);
    graphics.endFill();
  }

  // Draw a chip/badge (rounded rect)
  static drawChip(
    graphics: PIXI.Graphics,
    x: number,
    y: number,
    width: number,
    height: number,
    color: number,
    borderColor?: number
  ): void {
    x = snap(x);
    y = snap(y);

    // Main fill (with cut corners for pixel art "rounding")
    graphics.beginFill(color);

    // Top edge (minus corners)
    graphics.drawRect(x + 1, y, width - 2, 1);
    // Middle section
    graphics.drawRect(x, y + 1, width, height - 2);
    // Bottom edge (minus corners)
    graphics.drawRect(x + 1, y + height - 1, width - 2, 1);

    graphics.endFill();

    // Optional border
    if (borderColor !== undefined) {
      graphics.beginFill(borderColor);
      // Top-left corner
      graphics.drawRect(x + 1, y, 1, 1);
      // Top-right corner
      graphics.drawRect(x + width - 2, y, 1, 1);
      // Bottom-left corner
      graphics.drawRect(x + 1, y + height - 1, 1, 1);
      // Bottom-right corner
      graphics.drawRect(x + width - 2, y + height - 1, 1, 1);
      graphics.endFill();
    }
  }

  // Draw a separator line
  static drawSeparator(
    graphics: PIXI.Graphics,
    x: number,
    y: number,
    width: number,
    color: number = 0x243042,
    dashed: boolean = false
  ): void {
    x = snap(x);
    y = snap(y);

    if (dashed) {
      // Draw dashed line (2px on, 2px off)
      for (let i = 0; i < width; i += 4) {
        graphics.beginFill(color);
        graphics.drawRect(x + i, y, Math.min(2, width - i), 1);
        graphics.endFill();
      }
    } else {
      graphics.beginFill(color);
      graphics.drawRect(x, y, width, 1);
      graphics.endFill();
    }
  }

  // Draw a progress bar
  static drawProgressBar(
    graphics: PIXI.Graphics,
    x: number,
    y: number,
    width: number,
    height: number,
    progress: number, // 0.0 to 1.0
    fillColor: number = 0x00e0ff,
    bgColor: number = 0x161a1e,
    borderColor: number = 0x243042
  ): void {
    x = snap(x);
    y = snap(y);

    // Background
    graphics.beginFill(bgColor);
    graphics.drawRect(x, y, width, height);
    graphics.endFill();

    // Fill
    const fillWidth = Math.floor(width * progress);
    if (fillWidth > 0) {
      graphics.beginFill(fillColor);
      graphics.drawRect(x, y, fillWidth, height);
      graphics.endFill();
    }

    // Border
    graphics.lineStyle(1, borderColor);
    graphics.drawRect(x, y, width, height);
    graphics.lineStyle(0);
  }

  // Draw a pixel perfect icon/glyph
  static drawIcon(
    graphics: PIXI.Graphics,
    type: string,
    x: number,
    y: number,
    color: number
  ): void {
    x = snap(x);
    y = snap(y);

    graphics.beginFill(color);

    switch (type) {
      case 'star': // ★
        // 5x5 star pattern
        graphics.drawRect(x + 2, y, 1, 1); // Top
        graphics.drawRect(x + 1, y + 1, 3, 1); // Row 2
        graphics.drawRect(x, y + 2, 5, 1); // Middle (widest)
        graphics.drawRect(x + 1, y + 3, 3, 1); // Row 4
        graphics.drawRect(x, y + 4, 2, 1); // Bottom left
        graphics.drawRect(x + 3, y + 4, 2, 1); // Bottom right
        break;

      case 'dot': // •
        // 3x3 dot
        graphics.drawRect(x + 1, y + 1, 3, 3);
        break;

      case 'cross': // ✖
        // 5x5 X pattern
        graphics.drawRect(x, y, 1, 1);
        graphics.drawRect(x + 4, y, 1, 1);
        graphics.drawRect(x + 1, y + 1, 1, 1);
        graphics.drawRect(x + 3, y + 1, 1, 1);
        graphics.drawRect(x + 2, y + 2, 1, 1);
        graphics.drawRect(x + 1, y + 3, 1, 1);
        graphics.drawRect(x + 3, y + 3, 1, 1);
        graphics.drawRect(x, y + 4, 1, 1);
        graphics.drawRect(x + 4, y + 4, 1, 1);
        break;

      case 'arrow-up':
        graphics.drawRect(x + 2, y, 1, 5); // Stem
        graphics.drawRect(x + 1, y + 1, 1, 1); // Left
        graphics.drawRect(x + 3, y + 1, 1, 1); // Right
        break;

      case 'arrow-down':
        graphics.drawRect(x + 2, y, 1, 5); // Stem
        graphics.drawRect(x + 1, y + 3, 1, 1); // Left
        graphics.drawRect(x + 3, y + 3, 1, 1); // Right
        break;
    }

    graphics.endFill();
  }

  // Draw a scanline effect overlay
  static drawScanlines(
    graphics: PIXI.Graphics,
    x: number,
    y: number,
    width: number,
    height: number,
    color: number = 0x000000,
    alpha: number = 0.1
  ): void {
    graphics.beginFill(color, alpha);

    // Draw every other line
    for (let i = 0; i < height; i += 2) {
      graphics.drawRect(snap(x), snap(y + i), width, 1);
    }

    graphics.endFill();
  }

  // Draw a dithered gradient (Bayer 2x2 pattern)
  static drawDitheredGradient(
    graphics: PIXI.Graphics,
    x: number,
    y: number,
    width: number,
    height: number,
    color1: number,
    color2: number,
    horizontal: boolean = true
  ): void {
    const bayerMatrix = [
      [0, 2],
      [3, 1],
    ];

    for (let py = 0; py < height; py++) {
      for (let px = 0; px < width; px++) {
        const progress = horizontal ? px / width : py / height;
        const threshold = bayerMatrix[py % 2][px % 2] / 4;

        const color = progress > threshold ? color1 : color2;
        graphics.beginFill(color);
        graphics.drawRect(snap(x + px), snap(y + py), 1, 1);
        graphics.endFill();
      }
    }
  }

  // Draw a pulse/glow effect (for active elements)
  static drawPulse(
    graphics: PIXI.Graphics,
    x: number,
    y: number,
    width: number,
    height: number,
    color: number,
    intensity: number = 0.5 // 0.0 to 1.0
  ): void {
    const alpha = 0.2 + intensity * 0.3;
    graphics.beginFill(color, alpha);

    // Outer ring
    graphics.drawRect(snap(x - 1), snap(y - 1), width + 2, 1); // Top
    graphics.drawRect(snap(x - 1), snap(y + height), width + 2, 1); // Bottom
    graphics.drawRect(snap(x - 1), snap(y), 1, height); // Left
    graphics.drawRect(snap(x + width), snap(y), 1, height); // Right

    graphics.endFill();
  }
}
