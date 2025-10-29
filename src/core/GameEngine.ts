// Main game engine - ties together Well, pieces, scoring, and game loop

import { GameState, Piece, Outcome, Shape } from '@/types/game';
import { Well } from './Well';
import { PieceGenerator } from './PieceGenerator';
import { Input } from './Input';
import { getKickTable, SHAPE_COLORS } from './SRS';
import { ScoringSystem, RevTracker, EchoQueue } from '@/systems/scoring';
import { EventCallback, GameEvent } from '@/types/events';

export class GameEngine {
  private well: Well;
  private generator: PieceGenerator;
  private input: Input;
  private scoring: ScoringSystem;
  private revTracker: RevTracker;
  private echoQueue: EchoQueue;

  private state: GameState;
  private eventCallbacks: EventCallback[] = [];

  // Gravity
  private gravity: number = 1.0; // cells per second
  private gravityTimer: number = 0;

  // Lock delay
  private lockDelay: number = 0.5; // seconds
  private lockTimer: number = 0;
  private isOnGround: boolean = false;

  constructor(seed: number) {
    this.well = new Well(10, 20);
    this.generator = new PieceGenerator(seed);
    this.input = new Input();
    this.scoring = new ScoringSystem();
    this.revTracker = new RevTracker();
    this.echoQueue = new EchoQueue();

    this.state = this.createInitialState(seed);
    this.spawnPiece();
  }

  private createInitialState(seed: number): GameState {
    return {
      stage: 1,
      series: 1,
      target: 5000,
      total: 0,
      rev: 1.0,
      lastOutcomes: [],
      echoQueue: 0,
      credits: 0,
      modules: [],
      ownedVariants: this.generator.getVariants() as any,
      sealCount: 0,
      board: this.well.getBoard(),
      currentPiece: null,
      queue: [],
      held: null,
      canSwapHold: true,
      junkDeck: [],
      junkForecast: [],
      junkTimer: 0,
      junkTimerMax: 9.0,
      contracts: [],
      currentShowcase: null,
      seed,
      locksSinceLastClear: 0,
      piecesPlaced: 0,
    };
  }

  update(dt: number): void {
    if (!this.state.currentPiece) return;

    this.input.update(dt);
    this.handleInput();
    this.updateGravity(dt);
    this.updateLockDelay(dt);
  }

  private handleInput(): void {
    if (!this.state.currentPiece) return;

    // Hold
    if (this.input.getState().hold && this.state.canSwapHold) {
      this.swapHold();
    }

    // Rotation
    if (this.input.getState().rotateCW) {
      this.rotate(1);
    }
    if (this.input.getState().rotateCCW) {
      this.rotate(-1);
    }
    if (this.input.getState().rotate180) {
      this.rotate(2);
    }

    // Movement (with DAS)
    if (this.input.shouldMove('left')) {
      this.move(-1, 0);
    }
    if (this.input.shouldMove('right')) {
      this.move(1, 0);
    }

    // Soft drop
    if (this.input.shouldMove('down')) {
      this.move(0, 1);
    }

    // Hard drop
    if (this.input.getState().hardDrop) {
      this.hardDrop();
    }
  }

  private move(dx: number, dy: number): boolean {
    if (!this.state.currentPiece) return false;

    const newPiece = {
      ...this.state.currentPiece,
      x: this.state.currentPiece.x + dx,
      y: this.state.currentPiece.y + dy,
    };

    if (!this.well.collides(newPiece)) {
      this.state.currentPiece = newPiece;
      this.resetLockTimer();
      this.emit({ type: 'piece_move' });
      return true;
    }

    return false;
  }

  private rotate(direction: number): boolean {
    if (!this.state.currentPiece) return false;

    const piece = this.state.currentPiece;
    const newRotation = (piece.rotation + direction + 4) % 4;
    const kickTable = getKickTable(piece.shape);
    const kicks = kickTable[piece.rotation];

    // Try each kick
    for (const [dx, dy] of kicks) {
      const testPiece = {
        ...piece,
        rotation: newRotation,
        x: piece.x + dx,
        y: piece.y - dy, // Note: y is inverted in kick tables
      };

      if (!this.well.collides(testPiece)) {
        this.state.currentPiece = testPiece;
        this.resetLockTimer();
        this.emit({ type: 'piece_rotate' });
        return true;
      }
    }

    return false;
  }

  private hardDrop(): void {
    if (!this.state.currentPiece) return;

    let dropDistance = 0;
    while (this.move(0, 1)) {
      dropDistance++;
    }

    this.lockPiece();
    this.emit({ type: 'hard_drop' });
  }

  private swapHold(): void {
    if (!this.state.canSwapHold || !this.state.currentPiece) return;

    const current = this.state.currentPiece;

    if (this.state.held) {
      // Swap
      this.state.currentPiece = this.resetPiecePosition(this.state.held);
      this.state.held = this.resetPiecePosition(current);
    } else {
      // First hold
      this.state.held = this.resetPiecePosition(current);
      this.spawnPiece();
    }

    this.state.canSwapHold = false;
    this.resetLockTimer();
    this.emit({ type: 'hold_swap' });
  }

  private resetPiecePosition(piece: Piece): Piece {
    const spawnX = Math.floor((10 - this.getPieceWidth(piece.shape)) / 2);
    return { ...piece, x: spawnX, y: -2, rotation: 0 };
  }

  private getPieceWidth(shape: Shape): number {
    if (shape === 'I') return 4;
    if (shape === 'O') return 3;
    return 3;
  }

  private updateGravity(dt: number): void {
    if (!this.state.currentPiece) return;

    this.gravityTimer += dt * this.gravity;

    while (this.gravityTimer >= 1.0) {
      this.gravityTimer -= 1.0;
      if (!this.move(0, 1)) {
        this.isOnGround = true;
        break;
      }
    }
  }

  private updateLockDelay(dt: number): void {
    if (!this.state.currentPiece) return;

    // Check if piece is on ground
    const testPiece = {
      ...this.state.currentPiece,
      y: this.state.currentPiece.y + 1,
    };
    this.isOnGround = this.well.collides(testPiece);

    if (this.isOnGround) {
      this.lockTimer += dt;
      if (this.lockTimer >= this.lockDelay) {
        this.lockPiece();
      }
    } else {
      this.lockTimer = 0;
    }
  }

  private resetLockTimer(): void {
    this.lockTimer = 0;
  }

  private lockPiece(): void {
    if (!this.state.currentPiece) return;

    const piece = this.state.currentPiece;
    const color = SHAPE_COLORS[piece.shape];

    this.well.lockPiece(piece, color);
    this.state.canSwapHold = true;
    this.state.piecesPlaced++;
    this.state.locksSinceLastClear++;

    this.emit({ type: 'piece_lock', shape: piece.shape });

    // Check for line clears
    const filledLines = this.well.getFilledLines();
    if (filledLines.length > 0) {
      this.handleLineClear(filledLines);
    } else {
      // Check for miss (no clear after N locks)
      if (this.state.locksSinceLastClear >= 3) {
        this.handleMiss();
      }
    }

    // Spawn next piece
    this.spawnPiece();
  }

  private handleLineClear(lines: number[]): void {
    const linesCleared = lines.length;
    const cells = this.well.getLineCells(lines).flat();
    const isPerfectClear = this.well.isEmpty();

    // Calculate scoring
    const scoringContext = {
      linesCleared,
      isPerfectClear,
      cells,
      modules: this.state.modules,
      sealCount: this.state.sealCount,
      echoQueue: this.echoQueue.peek(),
      rev: this.revTracker.getRev(),
    };

    const result = this.scoring.compute(scoringContext);

    // Update state
    this.state.total += result.delta;
    this.state.credits += result.creditsGained;
    this.state.locksSinceLastClear = 0;

    // Handle Echo
    const echoCount = cells.filter((c) => c.badge === 'Echo').length;
    if (echoCount > 0) {
      const contribution = this.scoring.getEchoContribution(
        result.base,
        result.xValue
      );
      this.echoQueue.add(contribution);
    }
    this.echoQueue.consume(); // Consume queue after adding

    // Handle Seals (permanent economy boost)
    const sealCount = cells.filter((c) => c.badge === 'Seal').length;
    if (sealCount > 0) {
      this.state.sealCount += sealCount;
    }

    // Update Rev
    const isPrime = this.scoring.isPrime(linesCleared, isPerfectClear);
    if (isPrime) {
      this.revTracker.onPrime();
      this.addOutcome('prime');
      this.emit({ type: 'prime_clear' });
    } else {
      this.addOutcome('minor');
    }
    this.state.rev = this.revTracker.getRev();

    // Clear lines
    this.well.clearLines(lines);

    // Emit events
    this.emit({ type: 'line_clear', lines: linesCleared });
    this.emit({ type: 'scoring', result });
    if (isPerfectClear) {
      this.emit({ type: 'perfect_clear' });
    }
    if (result.creditsGained > 0) {
      this.emit({
        type: 'cache_collect',
        count: cells.filter((c) => c.badge === 'Cache').length,
        credits: result.creditsGained,
      });
    }
  }

  private handleMiss(): void {
    this.revTracker.onMiss();
    this.state.rev = this.revTracker.getRev();
    this.addOutcome('miss');
    this.state.locksSinceLastClear = 0;
    this.emit({ type: 'rev_down', newRev: this.state.rev });
  }

  private addOutcome(outcome: Outcome): void {
    this.state.lastOutcomes.push(outcome);
    if (this.state.lastOutcomes.length > 3) {
      this.state.lastOutcomes.shift();
    }
  }

  private spawnPiece(): void {
    // Fill queue if needed
    while (this.state.queue.length < 5) {
      this.state.queue.push(this.generator.next());
    }

    // Take from queue
    this.state.currentPiece = this.state.queue.shift()!;
    this.gravityTimer = 0;
    this.lockTimer = 0;
    this.isOnGround = false;

    // Check game over
    if (this.well.collides(this.state.currentPiece)) {
      this.emit({ type: 'game_over' });
    }
  }

  getState(): GameState {
    return this.state;
  }

  getWell(): Well {
    return this.well;
  }

  setGravity(gravity: number): void {
    this.gravity = gravity;
  }

  on(callback: EventCallback): void {
    this.eventCallbacks.push(callback);
  }

  private emit(event: GameEvent): void {
    this.eventCallbacks.forEach((cb) => cb(event));
  }

  destroy(): void {
    this.input.destroy();
  }
}
