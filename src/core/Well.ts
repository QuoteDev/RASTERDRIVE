// Well - The 10x20 Tetris board with collision detection and line clearing

import { Board, Cell, Piece, Badge } from '@/types/game';
import { getPieceShape } from './SRS';

export class Well {
  private board: Board;

  constructor(width: number = 10, height: number = 20) {
    this.board = {
      width,
      height,
      cells: this.createEmptyCells(width, height),
    };
  }

  private createEmptyCells(width: number, height: number): Cell[][] {
    const cells: Cell[][] = [];
    for (let y = 0; y < height; y++) {
      cells[y] = [];
      for (let x = 0; x < width; x++) {
        cells[y][x] = this.createEmptyCell();
      }
    }
    return cells;
  }

  private createEmptyCell(): Cell {
    return {
      filled: false,
      color: '',
      badge: 'None',
    };
  }

  getBoard(): Board {
    return this.board;
  }

  getCell(x: number, y: number): Cell | null {
    if (x < 0 || x >= this.board.width || y < 0 || y >= this.board.height) {
      return null;
    }
    return this.board.cells[y][x];
  }

  setCell(x: number, y: number, cell: Cell): void {
    if (x < 0 || x >= this.board.width || y < 0 || y >= this.board.height) {
      return;
    }
    this.board.cells[y][x] = cell;
  }

  // Check if piece collides with board or boundaries
  collides(piece: Piece): boolean {
    const shape = getPieceShape(piece.shape, piece.rotation);

    for (let y = 0; y < shape.length; y++) {
      for (let x = 0; x < shape[y].length; x++) {
        if (shape[y][x] === 0) continue;

        const boardX = piece.x + x;
        const boardY = piece.y + y;

        // Check boundaries
        if (
          boardX < 0 ||
          boardX >= this.board.width ||
          boardY >= this.board.height
        ) {
          return true;
        }

        // Allow pieces above the visible board (for spawning)
        if (boardY < 0) continue;

        // Check collision with filled cells
        if (this.board.cells[boardY][boardX].filled) {
          return true;
        }
      }
    }

    return false;
  }

  // Lock piece into the board
  lockPiece(piece: Piece, color: string): void {
    const shape = getPieceShape(piece.shape, piece.rotation);

    for (let y = 0; y < shape.length; y++) {
      for (let x = 0; x < shape[y].length; x++) {
        if (shape[y][x] === 0) continue;

        const boardX = piece.x + x;
        const boardY = piece.y + y;

        if (boardY >= 0 && boardY < this.board.height) {
          this.board.cells[boardY][boardX] = {
            filled: true,
            color,
            badge: piece.badge,
          };
        }
      }
    }
  }

  // Check and return filled lines (bottom to top)
  getFilledLines(): number[] {
    const filledLines: number[] = [];

    for (let y = this.board.height - 1; y >= 0; y--) {
      let isFilled = true;
      for (let x = 0; x < this.board.width; x++) {
        if (!this.board.cells[y][x].filled) {
          isFilled = false;
          break;
        }
      }
      if (isFilled) {
        filledLines.push(y);
      }
    }

    return filledLines;
  }

  // Get cells from specific lines (for scoring calculations)
  getLineCells(lines: number[]): Cell[][] {
    return lines.map((y) => [...this.board.cells[y]]);
  }

  // Clear lines and shift down
  clearLines(lines: number[]): void {
    // Sort lines from top to bottom
    const sortedLines = [...lines].sort((a, b) => a - b);

    // Remove cleared lines
    sortedLines.forEach((line) => {
      this.board.cells.splice(line, 1);
    });

    // Add new empty lines at the top
    for (let i = 0; i < sortedLines.length; i++) {
      const newLine: Cell[] = [];
      for (let x = 0; x < this.board.width; x++) {
        newLine.push(this.createEmptyCell());
      }
      this.board.cells.unshift(newLine);
    }
  }

  // Check if board is empty (Perfect Clear)
  isEmpty(): boolean {
    for (let y = 0; y < this.board.height; y++) {
      for (let x = 0; x < this.board.width; x++) {
        if (this.board.cells[y][x].filled) {
          return false;
        }
      }
    }
    return true;
  }

  // Get highest filled row (for stack height tracking)
  getStackHeight(): number {
    for (let y = 0; y < this.board.height; y++) {
      for (let x = 0; x < this.board.width; x++) {
        if (this.board.cells[y][x].filled) {
          return this.board.height - y;
        }
      }
    }
    return 0;
  }

  // Clear entire board
  clear(): void {
    this.board.cells = this.createEmptyCells(
      this.board.width,
      this.board.height
    );
  }

  // Count badges in cleared lines
  countBadges(lines: number[]): Record<Badge, number> {
    const counts: Record<Badge, number> = {
      None: 0,
      Echo: 0,
      Cache: 0,
      Seal: 0,
    };

    lines.forEach((y) => {
      for (let x = 0; x < this.board.width; x++) {
        const cell = this.board.cells[y][x];
        if (cell.filled && cell.badge !== 'None') {
          counts[cell.badge]++;
        }
      }
    });

    return counts;
  }
}
