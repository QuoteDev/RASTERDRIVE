// Queue and Hold renderer - Shows next pieces and held piece

import * as PIXI from 'pixi.js';
import { Piece } from '@/types/game';
import { getPieceShape, SHAPE_COLORS } from '@/core/SRS';
import { snap } from '@/utils/math';
import { PixelUI } from './PixelUI';
import { BitmapFont } from './BitmapFont';

const CELL_SIZE = 6; // Smaller cells for preview

export class QueueHoldRenderer {
  private container: PIXI.Container;
  private queueGraphics: PIXI.Graphics;
  private holdGraphics: PIXI.Graphics;

  constructor() {
    this.container = new PIXI.Container();
    this.queueGraphics = new PIXI.Graphics();
    this.holdGraphics = new PIXI.Graphics();

    this.container.addChild(this.holdGraphics);
    this.container.addChild(this.queueGraphics);

    // Position container (left side of screen)
    this.container.x = snap(10);
    this.container.y = snap(20);
  }

  render(queue: Piece[], held: Piece | null): void {
    this.holdGraphics.clear();
    this.queueGraphics.clear();

    // Draw Hold section
    this.drawHoldSection(held);

    // Draw Queue section
    this.drawQueueSection(queue);
  }

  private drawHoldSection(held: Piece | null): void {
    const sectionWidth = 60;
    const sectionHeight = 40;

    // Frame
    PixelUI.drawFrame(
      this.holdGraphics,
      0,
      0,
      sectionWidth,
      sectionHeight,
      0x0f1317,
      0x2a323a,
      0x161a1e
    );

    // Label
    BitmapFont.drawText(this.holdGraphics, 'HOLD', 4, 4, 0x9bb7ff);

    // Draw held piece if exists
    if (held) {
      this.drawPreviewPiece(this.holdGraphics, held, 15, 18);
    }
  }

  private drawQueueSection(queue: Piece[]): void {
    const sectionWidth = 60;
    const sectionHeight = 150;
    const startY = 45;

    // Frame
    PixelUI.drawFrame(
      this.queueGraphics,
      0,
      startY,
      sectionWidth,
      sectionHeight,
      0x0f1317,
      0x2a323a,
      0x161a1e
    );

    // Label
    BitmapFont.drawText(this.queueGraphics, 'NEXT', 4, startY + 4, 0x9bb7ff);

    // Draw up to 5 pieces in queue
    const displayCount = Math.min(5, queue.length);
    for (let i = 0; i < displayCount; i++) {
      const piece = queue[i];
      const yOffset = startY + 15 + i * 26;
      this.drawPreviewPiece(this.queueGraphics, piece, 15, yOffset);

      // Separator between pieces
      if (i < displayCount - 1) {
        PixelUI.drawSeparator(
          this.queueGraphics,
          4,
          yOffset + 20,
          sectionWidth - 8,
          0x243042,
          true
        );
      }
    }
  }

  private drawPreviewPiece(
    graphics: PIXI.Graphics,
    piece: Piece,
    offsetX: number,
    offsetY: number
  ): void {
    const shape = getPieceShape(piece.shape, 0); // Always show rotation 0
    const color = SHAPE_COLORS[piece.shape];
    const colorNum = parseInt(color.replace('#', ''), 16);

    // Calculate centering offset
    const shapeWidth = shape[0].length * CELL_SIZE;
    const shapeHeight = shape.length * CELL_SIZE;
    const centerX = offsetX - shapeWidth / 2;
    const centerY = offsetY - shapeHeight / 2;

    for (let y = 0; y < shape.length; y++) {
      for (let x = 0; x < shape[y].length; x++) {
        if (shape[y][x] === 0) continue;

        const px = snap(centerX + x * CELL_SIZE);
        const py = snap(centerY + y * CELL_SIZE);

        this.drawPreviewCell(graphics, px, py, colorNum, piece.badge);
      }
    }
  }

  private drawPreviewCell(
    graphics: PIXI.Graphics,
    x: number,
    y: number,
    color: number,
    badge: string
  ): void {
    // Main fill
    graphics.beginFill(color);
    graphics.drawRect(x, y, CELL_SIZE, CELL_SIZE);
    graphics.endFill();

    // Subtle highlight
    const highlightColor = this.lightenColor(color, 0.15);
    graphics.beginFill(highlightColor);
    graphics.drawRect(x + 1, y + 1, CELL_SIZE - 2, 1);
    graphics.drawRect(x + 1, y + 1, 1, CELL_SIZE - 2);
    graphics.endFill();

    // Badge indicator (tiny dot)
    if (badge === 'Echo') {
      graphics.beginFill(0x96f03c);
      graphics.drawRect(x + CELL_SIZE - 2, y + 1, 1, 1);
      graphics.endFill();
    } else if (badge === 'Cache') {
      graphics.beginFill(0xffbd2e);
      graphics.drawRect(x + CELL_SIZE - 2, y + 1, 1, 1);
      graphics.endFill();
    } else if (badge === 'Seal') {
      graphics.beginFill(0xff3aa7);
      graphics.drawRect(x + CELL_SIZE - 2, y + 1, 1, 1);
      graphics.endFill();
    }
  }

  private lightenColor(color: number, amount: number): number {
    const r = Math.min(255, ((color >> 16) & 0xff) + amount * 255);
    const g = Math.min(255, ((color >> 8) & 0xff) + amount * 255);
    const b = Math.min(255, (color & 0xff) + amount * 255);
    return (r << 16) | (g << 8) | b;
  }

  getContainer(): PIXI.Container {
    return this.container;
  }

  destroy(): void {
    this.container.destroy({ children: true });
  }
}
