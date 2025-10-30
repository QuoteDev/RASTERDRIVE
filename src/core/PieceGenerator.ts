// Weighted piece generator with anti-famine mechanic

import { Shape, PieceVariant, Piece, Badge } from '@/types/game';
import { PRNG } from '@/utils/prng';

const ANTI_FAMINE_WINDOW = 14;

export class PieceGenerator {
  private rng: PRNG;
  private variants: Map<Shape, PieceVariant[]>;
  private droughtCounters: Map<Shape, number>;
  private history: Shape[];

  constructor(seed: number, initialVariants?: PieceVariant[]) {
    this.rng = new PRNG(seed);
    this.variants = new Map();
    this.droughtCounters = new Map();
    this.history = [];

    // Initialize drought counters
    const shapes: Shape[] = ['I', 'O', 'T', 'S', 'Z', 'J', 'L'];
    shapes.forEach((shape) => {
      this.droughtCounters.set(shape, 0);
    });

    // Add initial variants if provided
    if (initialVariants) {
      initialVariants.forEach((variant) => this.addVariant(variant));
    } else {
      // Fallback to basic pieces
      this.initializeBasicPieces();
    }
  }

  private initializeBasicPieces(): void {
    const shapes: Shape[] = ['I', 'O', 'T', 'S', 'Z', 'J', 'L'];
    shapes.forEach((shape) => {
      this.variants.set(shape, [
        {
          id: `${shape}_basic`,
          shape,
          badge: 'None',
          weight: 1,
        },
      ]);
    });
  }

  addVariant(variant: PieceVariant): void {
    const variants = this.variants.get(variant.shape) || [];
    variants.push(variant);
    this.variants.set(variant.shape, variants);
  }

  removeVariant(variantId: string): void {
    this.variants.forEach((variants, shape) => {
      const filtered = variants.filter((v) => v.id !== variantId);
      if (filtered.length > 0) {
        this.variants.set(shape, filtered);
      }
    });
  }

  getVariants(): Map<Shape, PieceVariant[]> {
    return this.variants;
  }

  next(): Piece {
    const shape = this.selectShape();
    const variant = this.selectVariant(shape);

    // Reset drought counter for this shape
    this.droughtCounters.set(shape, 0);

    // Increment drought counters for other shapes
    this.droughtCounters.forEach((count, s) => {
      if (s !== shape) {
        this.droughtCounters.set(s, count + 1);
      }
    });

    // Add to history
    this.history.push(shape);
    if (this.history.length > ANTI_FAMINE_WINDOW) {
      this.history.shift();
    }

    return this.createPiece(shape, variant.badge);
  }

  private selectShape(): Shape {
    const shapes = Array.from(this.variants.keys());
    const weights = shapes.map((shape) => this.calculateShapeWeight(shape));

    const totalWeight = weights.reduce((sum, w) => sum + w, 0);
    let random = this.rng.next() * totalWeight;

    for (let i = 0; i < shapes.length; i++) {
      random -= weights[i];
      if (random <= 0) {
        return shapes[i];
      }
    }

    return shapes[shapes.length - 1];
  }

  private calculateShapeWeight(shape: Shape): number {
    // Base weight from variants
    const variants = this.variants.get(shape) || [];
    const baseWeight = variants.reduce((sum, v) => sum + v.weight, 0);

    // Anti-famine multiplier
    const droughtCount = this.droughtCounters.get(shape) || 0;
    const famineMultiplier = 1 + droughtCount * 0.15; // Increase weight by 15% per drought count

    return baseWeight * famineMultiplier;
  }

  private selectVariant(shape: Shape): PieceVariant {
    const variants = this.variants.get(shape) || [];
    if (variants.length === 0) {
      throw new Error(`No variants for shape ${shape}`);
    }

    const weights = variants.map((v) => v.weight);
    const totalWeight = weights.reduce((sum, w) => sum + w, 0);
    let random = this.rng.next() * totalWeight;

    for (let i = 0; i < variants.length; i++) {
      random -= weights[i];
      if (random <= 0) {
        return variants[i];
      }
    }

    return variants[variants.length - 1];
  }

  private createPiece(shape: Shape, badge: Badge): Piece {
    // Spawn position (centered at top)
    const spawnX = Math.floor((10 - this.getPieceWidth(shape)) / 2);
    const spawnY = -2; // Above visible board

    return {
      shape,
      badge,
      x: spawnX,
      y: spawnY,
      rotation: 0,
    };
  }

  private getPieceWidth(shape: Shape): number {
    if (shape === 'I') return 4;
    if (shape === 'O') return 3;
    return 3;
  }

  // Get history for debugging/stats
  getHistory(): Shape[] {
    return [...this.history];
  }

  // Get drought stats
  getDroughtStats(): Map<Shape, number> {
    return new Map(this.droughtCounters);
  }

  // Seed a new RNG (for testing)
  reseed(seed: number): void {
    this.rng = new PRNG(seed);
  }
}
