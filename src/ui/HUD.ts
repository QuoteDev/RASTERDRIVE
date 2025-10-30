// HUD - Pixel art displays for score, target, rev, credits, and breakdown

import * as PIXI from 'pixi.js';
import { GameState } from '@/types/game';
import { BitmapFont } from '@/render/BitmapFont';
import { PixelUI } from '@/render/PixelUI';

export class HUD {
  private container: PIXI.Container;
  private graphics: PIXI.Graphics;

  // Cached state for only redrawing when changed
  private lastState: Partial<GameState> = {};

  constructor() {
    this.container = new PIXI.Container();
    this.graphics = new PIXI.Graphics();
    this.container.addChild(this.graphics);

    // Draw initial static elements
    this.drawStaticElements();
  }

  private drawStaticElements(): void {
    // Right panel frame (Score pane)
    const panelX = 275;
    const panelY = 15;
    const panelWidth = 100;
    const panelHeight = 190;

    PixelUI.drawFrame(
      this.graphics,
      panelX,
      panelY,
      panelWidth,
      panelHeight,
      0x0f1317, // graphite bg
      0x2a323a, // slate border
      0x161a1e  // iron inner
    );
  }

  update(state: GameState): void {
    // Only redraw if state changed
    if (
      this.lastState.total === state.total &&
      this.lastState.target === state.target &&
      this.lastState.rev === state.rev &&
      this.lastState.credits === state.credits &&
      this.lastState.lastOutcomes === state.lastOutcomes
    ) {
      return;
    }

    // Clear dynamic content only
    this.graphics.clear();

    // Redraw static elements
    this.drawStaticElements();

    // Draw all dynamic content
    this.drawContent(state);

    // Cache state
    this.lastState = {
      total: state.total,
      target: state.target,
      rev: state.rev,
      credits: state.credits,
      lastOutcomes: [...state.lastOutcomes],
    };
  }

  private drawContent(state: GameState): void {
    const rightX = 280;
    let y = 20;

    // ========================================
    // STAGE TOTAL (Giant)
    // ========================================
    BitmapFont.drawText(
      this.graphics,
      'STAGE TOTAL',
      rightX,
      y,
      0x9bb7ff // paper2
    );
    y += 10;

    BitmapFont.drawGiantText(
      this.graphics,
      state.total.toString(),
      rightX,
      y,
      0xe6f2ff, // paper
      0x9bb7ff   // paper2 highlight
    );
    y += 28;

    // Separator
    PixelUI.drawSeparator(this.graphics, rightX, y, 85, 0x243042);
    y += 6;

    // ========================================
    // TARGET (with chip background)
    // ========================================
    BitmapFont.drawText(this.graphics, 'TARGET', rightX, y, 0x9bb7ff);
    y += 10;

    // Target chip
    const targetText = state.target.toString();
    const targetWidth = BitmapFont.measureText(targetText, 2);
    PixelUI.drawChip(
      this.graphics,
      rightX - 2,
      y - 2,
      targetWidth + 6,
      16,
      0x161a1e, // iron
      0x2a323a  // slate border
    );

    BitmapFont.drawLargeText(
      this.graphics,
      targetText,
      rightX + 1,
      y,
      0x00e0ff // cyan accent
    );
    y += 20;

    // ========================================
    // BREAKDOWN
    // ========================================
    BitmapFont.drawText(this.graphics, 'BREAKDOWN', rightX, y, 0x9bb7ff);
    y += 10;

    // Format: "BASE 800 × ×2.5 (+CARRY 150)"
    let breakdownText = '---';
    if (state.lastScoringResult) {
      const r = state.lastScoringResult;
      breakdownText = `BASE ${r.base} × ×${r.xValue.toFixed(1)}`;
      if (r.carryAdd > 0) {
        breakdownText += ` (+${r.carryAdd})`;
      }
    }
    BitmapFont.drawText(
      this.graphics,
      breakdownText,
      rightX,
      y,
      0xe6f2ff // paper
    );
    y += 12;

    // ========================================
    // REV
    // ========================================
    BitmapFont.drawText(this.graphics, 'REV', rightX, y, 0x9bb7ff);
    y += 10;

    const revText = `×${state.rev.toFixed(1)}`;
    BitmapFont.drawLargeText(
      this.graphics,
      revText,
      rightX,
      y,
      state.rev >= 2.0 ? 0x96f03c : 0xe6f2ff // lime if high, paper otherwise
    );
    y += 18;

    // Outcome pips
    this.drawOutcomePips(state.lastOutcomes, rightX, y);
    y += 12;

    // ========================================
    // CREDITS
    // ========================================
    PixelUI.drawSeparator(this.graphics, rightX, y, 85, 0x243042);
    y += 6;

    BitmapFont.drawText(this.graphics, 'CREDITS', rightX, y, 0x9bb7ff);
    y += 10;

    const creditsText = `$${state.credits}`;
    BitmapFont.drawLargeText(
      this.graphics,
      creditsText,
      rightX,
      y,
      0xffbd2e // yellow
    );
  }

  private drawOutcomePips(
    outcomes: ('prime' | 'minor' | 'miss')[],
    x: number,
    y: number
  ): void {
    // Pad to always show 3 pips
    const pips = [...outcomes];
    while (pips.length < 3) {
      pips.unshift('minor');
    }

    // Only show last 3
    const displayPips = pips.slice(-3);

    let offsetX = 0;
    displayPips.forEach((outcome) => {
      let color: number;
      let type: string;

      if (outcome === 'prime') {
        color = 0x00e0ff; // cyan
        type = 'star';
      } else if (outcome === 'miss') {
        color = 0xff4d2e; // vermilion
        type = 'cross';
      } else {
        color = 0x2a323a; // slate (dim)
        type = 'dot';
      }

      PixelUI.drawIcon(this.graphics, type, x + offsetX, y, color);
      offsetX += 8;
    });
  }

  getContainer(): PIXI.Container {
    return this.container;
  }

  destroy(): void {
    this.container.destroy({ children: true });
  }
}
