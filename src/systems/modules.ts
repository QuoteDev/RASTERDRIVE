// Modules system - applies module effects to scoring

import { getModuleById } from '@/content/modules';
import { Cell } from '@/types/game';

export interface ModuleContext {
  // Clear info
  linesCleared: number;
  cells: Cell[];
  isPerfectClear: boolean;

  // Stack info
  stackHeight: number;

  // Module info
  modules: string[];
  modulesFiredThisStage: Set<string>;

  // History
  lastClearLines: number;
  consecutivePrimes: number;
  clearsThisStage: number;
  isFirstClear: boolean;

  // Current values
  baseScore: number;
  currentRev: number;
  credits: number;
  sealCount: number;

  // Stage info
  missesThisStage: number;
}

export interface ModuleEffect {
  baseAdd?: number;
  revAdd?: number;
  ampMultiply?: number;
  creditsAdd?: number;
  effectText?: string;
}

export class ModulesEngine {
  // Track state across clears
  private lastClearLines: number = 0;
  private consecutivePrimes: number = 0;
  private clearsThisStage: number = 0;
  private missesThisStage: number = 0;
  private modulesFiredThisStage: Set<string> = new Set();
  private accumulatorStacks: number = 0;

  reset(): void {
    this.lastClearLines = 0;
    this.consecutivePrimes = 0;
    this.clearsThisStage = 0;
    this.missesThisStage = 0;
    this.modulesFiredThisStage = new Set();
    this.accumulatorStacks = 0;
  }

  resetStage(): void {
    this.clearsThisStage = 0;
    this.missesThisStage = 0;
    this.modulesFiredThisStage = new Set();
    this.accumulatorStacks = 0;
  }

  onPrime(): void {
    this.consecutivePrimes++;
  }

  onNonPrime(): void {
    this.consecutivePrimes = 0;
  }

  onMiss(): void {
    this.missesThisStage++;
    this.consecutivePrimes = 0;
  }

  // Apply all module effects and return combined effect
  applyModules(context: ModuleContext): ModuleEffect[] {
    const effects: ModuleEffect[] = [];

    context.modules.forEach((moduleId) => {
      const module = getModuleById(moduleId);
      if (!module) return;

      const effect = this.applyModule(moduleId, context);
      if (effect) {
        effects.push(effect);
      }
    });

    return effects;
  }

  private applyModule(moduleId: string, ctx: ModuleContext): ModuleEffect | null {
    // BASE+ Modules
    if (moduleId === 'feedback_loop') {
      if (this.lastClearLines >= 2) {
        return { baseAdd: 150, effectText: '+150 Base' };
      }
    }

    if (moduleId === 'first_strike') {
      if (ctx.isFirstClear) {
        return { baseAdd: 200, effectText: '+200 Base' };
      }
    }

    if (moduleId === 'accumulator') {
      this.accumulatorStacks++;
      const bonus = this.accumulatorStacks * 50;
      return { baseAdd: bonus, effectText: `+${bonus} Base` };
    }

    if (moduleId === 'perfect_bonus') {
      if (ctx.isPerfectClear) {
        return { baseAdd: 500, effectText: '+500 Base' };
      }
    }

    if (moduleId === 'quad_master') {
      if (ctx.linesCleared === 4) {
        return { baseAdd: 300, effectText: '+300 Base' };
      }
    }

    if (moduleId === 'echo_chamber') {
      const echoCount = ctx.cells.filter((c) => c.badge === 'Echo').length;
      if (echoCount > 0) {
        const bonus = echoCount * 100;
        return { baseAdd: bonus, effectText: `+${bonus} Base` };
      }
    }

    if (moduleId === 'seal_of_approval') {
      const sealCount = ctx.cells.filter((c) => c.badge === 'Seal').length;
      if (sealCount > 0) {
        const bonus = sealCount * 100;
        return { baseAdd: bonus, effectText: `+${bonus} Base` };
      }
    }

    // REV+ Modules
    if (moduleId === 'sequence_engine') {
      const validSequence =
        (this.lastClearLines === 2 && ctx.linesCleared === 4) ||
        (this.lastClearLines === 4 && ctx.linesCleared === 2);
      if (validSequence) {
        return { revAdd: 0.5, effectText: '+0.5 Rev' };
      }
    }

    if (moduleId === 'momentum') {
      // This is checked in the miss handler
      if (ctx.missesThisStage === 0) {
        return null; // Passive effect
      }
    }

    if (moduleId === 'prime_surge') {
      // This modifies the base prime bonus (+1.0 instead of +0.5)
      // Handled in GameEngine
      return null;
    }

    if (moduleId === 'chain_reaction') {
      if (this.consecutivePrimes >= 3) {
        return { revAdd: 0.3, effectText: '+0.3 Rev' };
      }
    }

    // ×AMP Modules
    if (moduleId === 'catalog_shot') {
      // Check if all cells are same shape (simplified check)
      const shapes = new Set(ctx.cells.map((c) => c.color));
      if (shapes.size === 1) {
        return { ampMultiply: 1.6, effectText: '×1.6' };
      }
    }

    if (moduleId === 'diversity') {
      const shapes = new Set(ctx.cells.map((c) => c.color));
      if (shapes.size >= 3) {
        return { ampMultiply: 1.3, effectText: '×1.3' };
      }
    }

    if (moduleId === 'tall_stack') {
      if (ctx.stackHeight >= 15) {
        return { ampMultiply: 1.4, effectText: '×1.4' };
      }
    }

    if (moduleId === 'low_ceiling') {
      if (ctx.stackHeight <= 8) {
        return { ampMultiply: 1.5, effectText: '×1.5' };
      }
    }

    if (moduleId === 'double_double') {
      if (ctx.linesCleared === 2) {
        return { ampMultiply: 2.0, effectText: '×2.0' };
      }
    }

    if (moduleId === 'quad_king') {
      if (ctx.linesCleared === 4) {
        return { ampMultiply: 2.5, effectText: '×2.5' };
      }
    }

    if (moduleId === 'synergy_core') {
      const moduleCount = ctx.modules.length;
      const mult = 1 + (moduleCount - 1) * 0.1; // -1 to exclude self
      return { ampMultiply: mult, effectText: `×${mult.toFixed(1)}` };
    }

    if (moduleId === 'cache_multiplier') {
      const hasCache = ctx.cells.some((c) => c.badge === 'Cache');
      if (hasCache) {
        return { ampMultiply: 1.2, effectText: '×1.2' };
      }
    }

    // ECONOMY Modules
    if (moduleId === 'bulkhead') {
      const cacheCount = ctx.cells.filter((c) => c.badge === 'Cache').length;
      const hasSeals = ctx.cells.some((c) => c.badge === 'Seal');
      if (cacheCount > 0) {
        const bonus = cacheCount + (hasSeals ? cacheCount : 0);
        return { creditsAdd: bonus, effectText: `+$${bonus}` };
      }
    }

    if (moduleId === 'interest') {
      const bonus = Math.min(10, Math.floor(ctx.credits / 5));
      if (bonus > 0) {
        return { creditsAdd: bonus, effectText: `+$${bonus}` };
      }
    }

    if (moduleId === 'jackpot') {
      if (ctx.isPerfectClear) {
        return { creditsAdd: 20, effectText: '+$20' };
      }
    }

    // RNG Modules - passive effects, no immediate effect
    if (
      moduleId === 'imprint' ||
      moduleId === 'avoid' ||
      moduleId === 'i_piece_lover' ||
      moduleId === 't_spin_setup' ||
      moduleId === 'lucky_seven'
    ) {
      return null;
    }

    return null;
  }

  // Called after clear to update state
  afterClear(linesCleared: number): void {
    this.lastClearLines = linesCleared;
    this.clearsThisStage++;
  }

  getConsecutivePrimes(): number {
    return this.consecutivePrimes;
  }

  shouldPreventRevLoss(moduleIds: string[]): boolean {
    // Momentum: prevent first Miss
    if (
      moduleIds.includes('momentum') &&
      this.missesThisStage === 0
    ) {
      return true;
    }
    return false;
  }

  getRevBonusMultiplier(moduleIds: string[]): number {
    // Prime Surge: +1.0 instead of +0.5
    if (moduleIds.includes('prime_surge')) {
      return 2.0;
    }
    return 1.0;
  }

  getRevFloor(moduleIds: string[]): number {
    // Rev Floor: cannot go below 1.5
    if (moduleIds.includes('rev_floor')) {
      return 1.5;
    }
    return 1.0;
  }
}
