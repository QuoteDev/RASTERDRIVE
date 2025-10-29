// Well renderer - Pixel art rendering for the game board and pieces

import * as PIXI from 'pixi.js';
import { Board, Piece } from '@/types/game';
import { getPieceShape, SHAPE_COLORS } from '@/core/SRS';
import { snap } from '@/utils/math';
import { PixelUI } from './PixelUI';

const CELL_SIZE = 8;
const WELL_PADDING = 2;

export class WellRenderer {
  private container: PIXI.Container;
  private bgGraphics: PIXI.Graphics;
  private cellGraphics: PIXI.Graphics;
  private pieceGraphics: PIXI.Graphics;
  private boardWidth: number;
  private boardHeight: number;

  constructor(boardWidth: number = 10, boardHeight: number = 20) {
    this.container = new PIXI.Container();
    this.boardWidth = boardWidth;
    this.boardHeight = boardHeight;

    // Create layers
    this.bgGraphics = new PIXI.Graphics();
    this.cellGraphics = new PIXI.Graphics();
    this.pieceGraphics = new PIXI.Graphics();

    this.container.addChild(this.bgGraphics);
    this.container.addChild(this.cellGraphics);
    this.container.addChild(this.pieceGraphics);

    // Draw well background
    this.drawWellBackground();

    // Position container
    this.container.x = snap(100);
    this.container.y = snap(20);
  }

  private drawWellBackground(): void {
    this.bgGraphics.clear();

    const wellWidth = this.boardWidth * CELL_SIZE + WELL_PADDING * 2;
    const wellHeight = this.boardHeight * CELL_SIZE + WELL_PADDING * 2;

    // Outer frame (2px thick)
    PixelUI.drawFrame(
      this.bgGraphics,
      0,
      0,
      wellWidth,
      wellHeight,
      0x0f1317, // graphite inner
      0x2a323a, // slate outer
      0x161a1e  // iron middle
    );

    // Draw subtle grid lines
    this.bgGraphics.beginFill(0x161a1e, 0.3);
    for (let x = 1; x < this.boardWidth; x++) {
      const px = WELL_PADDING + x * CELL_SIZE;
      this.bgGraphics.drawRect(snap(px), WELL_PADDING, 1, this.boardHeight * CELL_SIZE);
    }
    for (let y = 1; y < this.boardHeight; y++) {
      const py = WELL_PADDING + y * CELL_SIZE;
      this.bgGraphics.drawRect(WELL_PADDING, snap(py), this.boardWidth * CELL_SIZE, 1);
    }
    this.bgGraphics.endFill();
  }

  render(board: Board, currentPiece: Piece | null): void {
    // Clear cell and piece layers
    this.cellGraphics.clear();
    this.pieceGraphics.clear();

    // Render board cells
    for (let y = 0; y < board.height; y++) {
      for (let x = 0; x < board.width; x++) {
        const cell = board.cells[y][x];
        if (cell.filled) {
          const px = WELL_PADDING + x * CELL_SIZE;
          const py = WELL_PADDING + y * CELL_SIZE;
          this.drawPixelCell(
            this.cellGraphics,
            snap(px),
            snap(py),
            cell.color,
            cell.badge
          );
        }
      }
    }

    // Render current piece
    if (currentPiece) {
      this.drawPiece(currentPiece);
    }
  }

  private drawPixelCell(
    graphics: PIXI.Graphics,
    x: number,
    y: number,
    color: string,
    badge: string
  ): void {
    const colorNum = parseInt(color.replace('#', ''), 16);

    // Main cell fill (6x6 inner)
    graphics.beginFill(colorNum);
    graphics.drawRect(x + 1, y + 1, CELL_SIZE - 2, CELL_SIZE - 2);
    graphics.endFill();

    // Inner highlight (top-left, 2px)
    const highlightColor = this.lightenColor(colorNum, 0.2);
    graphics.beginFill(highlightColor);
    graphics.drawRect(x + 2, y + 2, CELL_SIZE - 4, 1); // Top edge
    graphics.drawRect(x + 2, y + 2, 1, CELL_SIZE - 4); // Left edge
    graphics.endFill();

    // Border/shadow (darker)
    const shadowColor = this.darkenColor(colorNum, 0.3);
    graphics.beginFill(shadowColor);
    graphics.drawRect(x, y, CELL_SIZE, 1); // Top
    graphics.drawRect(x, y, 1, CELL_SIZE); // Left
    graphics.drawRect(x, y + CELL_SIZE - 1, CELL_SIZE, 1); // Bottom
    graphics.drawRect(x + CELL_SIZE - 1, y, 1, CELL_SIZE); // Right
    graphics.endFill();

    // Badge indicator (pixel art icon in corner)
    if (badge === 'Echo') {
      this.drawBadgeIcon(graphics, 'E', x + CELL_SIZE - 3, y + 1, 0x96f03c);
    } else if (badge === 'Cache') {
      this.drawBadgeIcon(graphics, 'C', x + CELL_SIZE - 3, y + 1, 0xffbd2e);
    } else if (badge === 'Seal') {
      this.drawBadgeIcon(graphics, 'S', x + CELL_SIZE - 3, y + 1, 0xff3aa7);
    }
  }

  private drawBadgeIcon(
    graphics: PIXI.Graphics,
    letter: string,
    x: number,
    y: number,
    color: number
  ): void {
    // Simple 2x3 letter patterns
    graphics.beginFill(color);

    if (letter === 'E') {
      graphics.drawRect(x, y, 2, 1);
      graphics.drawRect(x, y + 1, 1, 1);
      graphics.drawRect(x, y + 2, 2, 1);
    } else if (letter === 'C') {
      graphics.drawRect(x, y, 2, 1);
      graphics.drawRect(x, y + 1, 1, 1);
      graphics.drawRect(x, y + 2, 2, 1);
    } else if (letter === 'S') {
      graphics.drawRect(x, y, 2, 1);
      graphics.drawRect(x + 1, y + 1, 1, 1);
      graphics.drawRect(x, y + 2, 2, 1);
    }

    graphics.endFill();
  }

  private drawPiece(piece: Piece): void {
    const shape = getPieceShape(piece.shape, piece.rotation);
    const color = SHAPE_COLORS[piece.shape];

    for (let y = 0; y < shape.length; y++) {
      for (let x = 0; x < shape[y].length; x++) {
        if (shape[y][x] === 0) continue;

        const boardX = piece.x + x;
        const boardY = piece.y + y;

        // Skip if outside visible area
        if (boardY < 0 || boardY >= this.boardHeight) continue;
        if (boardX < 0 || boardX >= this.boardWidth) continue;

        const px = WELL_PADDING + boardX * CELL_SIZE;
        const py = WELL_PADDING + boardY * CELL_SIZE;

        this.drawPixelCell(
          this.pieceGraphics,
          snap(px),
          snap(py),
          color,
          piece.badge
        );
      }
    }
  }

  // Helper to lighten a color
  private lightenColor(color: number, amount: number): number {
    const r = Math.min(255, ((color >> 16) & 0xff) + amount * 255);
    const g = Math.min(255, ((color >> 8) & 0xff) + amount * 255);
    const b = Math.min(255, (color & 0xff) + amount * 255);
    return (r << 16) | (g << 8) | b;
  }

  // Helper to darken a color
  private darkenColor(color: number, amount: number): number {
    const r = Math.max(0, ((color >> 16) & 0xff) * (1 - amount));
    const g = Math.max(0, ((color >> 8) & 0xff) * (1 - amount));
    const b = Math.max(0, (color & 0xff) * (1 - amount));
    return (r << 16) | (g << 8) | b;
  }

  getContainer(): PIXI.Container {
    return this.container;
  }

  destroy(): void {
    this.container.destroy({ children: true });
  }
}
