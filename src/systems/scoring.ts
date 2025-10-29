// Scoring system - Base, Rev, X multiplier, Carry (Echo), Cache/Seal economy

import { ScoringContext, ScoringResult } from '@/types/game';

// Base scoring table
const BASE_SCORES: Record<number, number> = {
  1: 100,
  2: 300,
  3: 500,
  4: 800,
};

const PERFECT_CLEAR_BONUS = 2000;

export class ScoringSystem {
  compute(context: ScoringContext): ScoringResult {
    // Calculate base score
    const base = this.calculateBase(context);

    // Calculate X (combined multiplier)
    const xValue = this.calculateX(context);

    // Calculate Echo carry
    const carryAdd = context.echoQueue;

    // Total delta
    const delta = Math.floor(base * xValue + carryAdd);

    // Calculate credits from Cache/Seal
    const creditsGained = this.calculateCredits(context);

    return {
      base,
      xValue,
      carryAdd,
      delta,
      creditsGained,
    };
  }

  private calculateBase(context: ScoringContext): number {
    let base = BASE_SCORES[context.linesCleared] || 0;

    if (context.isPerfectClear) {
      base += PERFECT_CLEAR_BONUS;
    }

    return base;
  }

  private calculateX(context: ScoringContext): number {
    // Start with Rev
    let x = context.rev;

    // Apply module multipliers (placeholder - will be implemented with modules system)
    // Modules will hook into this via the modules array

    return x;
  }

  private calculateCredits(context: ScoringContext): number {
    // Count Cache badges in cleared cells
    let cacheCount = 0;
    context.cells.forEach((cell) => {
      if (cell.badge === 'Cache') {
        cacheCount++;
      }
    });

    if (cacheCount === 0) return 0;

    // Base value per Cache is 1
    let valuePerCache = 1;

    // Add Seal bonus: each Seal in inventory adds +1 to Cache value
    valuePerCache += context.sealCount;

    // Check if any Seal was in the same clear (immediate bonus)
    const sealsInClear = context.cells.filter(
      (cell) => cell.badge === 'Seal'
    ).length;

    // Total credits
    return cacheCount * valuePerCache + sealsInClear;
  }

  // Calculate if a clear is Prime
  isPrime(linesCleared: number, isPerfectClear: boolean): boolean {
    // Default Prime rule: 2+ lines or Perfect Clear
    return linesCleared >= 2 || isPerfectClear;
  }

  // Get Echo contribution for queueing
  getEchoContribution(base: number, xValue: number): number {
    return Math.floor(base * xValue);
  }
}

// Rev tracker
export class RevTracker {
  private rev: number = 1.0;
  private revStep: number = 0.5;
  private revMax: number = 5.0;
  private revMin: number = 1.0;

  getRev(): number {
    return this.rev;
  }

  setRev(value: number): void {
    this.rev = Math.max(this.revMin, Math.min(this.revMax, value));
  }

  onPrime(): void {
    this.rev = Math.min(this.revMax, this.rev + this.revStep);
  }

  onMiss(): void {
    this.rev = Math.max(this.revMin, this.rev - this.revStep);
  }

  reset(): void {
    this.rev = 1.0;
  }

  setMax(max: number): void {
    this.revMax = max;
  }

  setStep(step: number): void {
    this.revStep = step;
  }
}

// Echo queue manager
export class EchoQueue {
  private queue: number = 0;

  add(value: number): void {
    this.queue += value;
  }

  consume(): number {
    const value = this.queue;
    this.queue = 0;
    return value;
  }

  peek(): number {
    return this.queue;
  }

  clear(): void {
    this.queue = 0;
  }
}
