// Well renderer - renders the game board and pieces

import * as PIXI from 'pixi.js';
import { Board, Piece } from '@/types/game';
import { getPieceShape, SHAPE_COLORS } from '@/core/SRS';
import { snap } from '@/utils/math';

const CELL_SIZE = 8;
const WELL_PADDING = 2;

export class WellRenderer {
  private container: PIXI.Container;
  private cellGraphics: PIXI.Graphics[][];
  private pieceGraphics: PIXI.Graphics;
  private boardWidth: number;
  private boardHeight: number;

  constructor(boardWidth: number = 10, boardHeight: number = 20) {
    this.container = new PIXI.Container();
    this.boardWidth = boardWidth;
    this.boardHeight = boardHeight;

    // Create cell graphics grid
    this.cellGraphics = [];
    for (let y = 0; y < boardHeight; y++) {
      this.cellGraphics[y] = [];
      for (let x = 0; x < boardWidth; x++) {
        const cell = new PIXI.Graphics();
        cell.x = snap(WELL_PADDING + x * CELL_SIZE);
        cell.y = snap(WELL_PADDING + y * CELL_SIZE);
        this.cellGraphics[y][x] = cell;
        this.container.addChild(cell);
      }
    }

    // Create piece graphics
    this.pieceGraphics = new PIXI.Graphics();
    this.container.addChild(this.pieceGraphics);

    // Draw well background
    this.drawWellBackground();

    // Position container
    this.container.x = snap(100);
    this.container.y = snap(20);
  }

  private drawWellBackground(): void {
    const bg = new PIXI.Graphics();

    // Outer border filled rectangle
    bg.beginFill(0x121820);
    bg.drawRect(
      0,
      0,
      this.boardWidth * CELL_SIZE + WELL_PADDING * 2,
      this.boardHeight * CELL_SIZE + WELL_PADDING * 2
    );
    bg.endFill();

    // Inner keyline
    bg.lineStyle(1, 0x243042);
    bg.drawRect(
      1,
      1,
      this.boardWidth * CELL_SIZE + WELL_PADDING * 2 - 2,
      this.boardHeight * CELL_SIZE + WELL_PADDING * 2 - 2
    );

    this.container.addChildAt(bg, 0);
  }

  render(board: Board, currentPiece: Piece | null): void {
    // Render board cells
    for (let y = 0; y < board.height; y++) {
      for (let x = 0; x < board.width; x++) {
        const cell = board.cells[y][x];
        const graphics = this.cellGraphics[y][x];
        graphics.clear();

        if (cell.filled) {
          this.drawCell(graphics, 0, 0, cell.color, cell.badge);
        }
      }
    }

    // Render current piece
    this.pieceGraphics.clear();
    if (currentPiece) {
      this.drawPiece(currentPiece);
    }
  }

  private drawCell(
    graphics: PIXI.Graphics,
    offsetX: number,
    offsetY: number,
    color: string,
    badge: string
  ): void {
    const x = offsetX;
    const y = offsetY;
    const size = CELL_SIZE;

    // Parse color
    const colorNum = parseInt(color.replace('#', ''), 16);

    // Main fill
    graphics.beginFill(colorNum);
    graphics.drawRect(x, y, size, size);
    graphics.endFill();

    // Inner keyline (1px lighter)
    graphics.lineStyle(1, 0x2a323a);
    graphics.drawRect(x + 1, y + 1, size - 2, size - 2);
    graphics.lineStyle(0); // Reset line style

    // Badge indicator (small dot in corner)
    if (badge === 'Echo') {
      graphics.beginFill(0x96f03c);
      graphics.drawCircle(x + size - 2, y + 2, 1);
      graphics.endFill();
    } else if (badge === 'Cache') {
      graphics.beginFill(0xffbd2e);
      graphics.drawCircle(x + size - 2, y + 2, 1);
      graphics.endFill();
    } else if (badge === 'Seal') {
      graphics.beginFill(0xff3aa7);
      graphics.drawCircle(x + size - 2, y + 2, 1);
      graphics.endFill();
    }
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

        const pixelX = snap(WELL_PADDING + boardX * CELL_SIZE);
        const pixelY = snap(WELL_PADDING + boardY * CELL_SIZE);

        this.drawCell(this.pieceGraphics, pixelX, pixelY, color, piece.badge);
      }
    }
  }

  getContainer(): PIXI.Container {
    return this.container;
  }

  destroy(): void {
    this.container.destroy({ children: true });
  }
}
