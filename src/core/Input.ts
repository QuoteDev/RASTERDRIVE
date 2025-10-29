// Input system with rebindable keys

import { InputState } from '@/types/game';

export type InputAction =
  | 'left'
  | 'right'
  | 'down'
  | 'hardDrop'
  | 'rotateCW'
  | 'rotateCCW'
  | 'rotate180'
  | 'hold'
  | 'pause';

export class Input {
  private keyState: Map<string, boolean> = new Map();
  private keyBindings: Map<InputAction, string> = new Map();
  private prevState: InputState;
  private currentState: InputState;

  // DAS (Delayed Auto Shift) settings
  private dasDelay: number = 0.133; // 133ms
  private dasRepeat: number = 0.033; // 33ms (ARR)
  private dasTimers: Map<InputAction, number> = new Map();

  constructor() {
    // Default key bindings
    this.setDefaultBindings();

    this.prevState = this.createEmptyState();
    this.currentState = this.createEmptyState();

    window.addEventListener('keydown', (e) => this.onKeyDown(e));
    window.addEventListener('keyup', (e) => this.onKeyUp(e));
  }

  private setDefaultBindings(): void {
    this.keyBindings.set('left', 'ArrowLeft');
    this.keyBindings.set('right', 'ArrowRight');
    this.keyBindings.set('down', 'ArrowDown');
    this.keyBindings.set('hardDrop', ' '); // Space
    this.keyBindings.set('rotateCW', 'ArrowUp');
    this.keyBindings.set('rotateCCW', 'KeyZ');
    this.keyBindings.set('rotate180', 'KeyA');
    this.keyBindings.set('hold', 'KeyC');
    this.keyBindings.set('pause', 'Escape');
  }

  private onKeyDown(e: KeyboardEvent): void {
    this.keyState.set(e.code, true);
  }

  private onKeyUp(e: KeyboardEvent): void {
    this.keyState.set(e.code, false);
    // Reset DAS timer on key release
    this.keyBindings.forEach((key, action) => {
      if (key === e.code) {
        this.dasTimers.set(action, 0);
      }
    });
  }

  update(dt: number): void {
    this.prevState = { ...this.currentState };

    // Update current state
    this.currentState.left = this.isActionDown('left');
    this.currentState.right = this.isActionDown('right');
    this.currentState.down = this.isActionDown('down');
    this.currentState.hardDrop = this.isActionPressed('hardDrop');
    this.currentState.rotateCW = this.isActionPressed('rotateCW');
    this.currentState.rotateCCW = this.isActionPressed('rotateCCW');
    this.currentState.rotate180 = this.isActionPressed('rotate180');
    this.currentState.hold = this.isActionPressed('hold');

    // Update DAS timers for repeating actions
    this.updateDAS(dt, 'left');
    this.updateDAS(dt, 'right');
    this.updateDAS(dt, 'down');
  }

  private updateDAS(dt: number, action: InputAction): void {
    if (!this.isActionDown(action)) {
      this.dasTimers.set(action, 0);
      return;
    }

    const timer = this.dasTimers.get(action) || 0;
    this.dasTimers.set(action, timer + dt);
  }

  private isActionDown(action: InputAction): boolean {
    const key = this.keyBindings.get(action);
    return key ? (this.keyState.get(key) || false) : false;
  }

  private isActionPressed(action: InputAction): boolean {
    const key = this.keyBindings.get(action);
    if (!key) return false;

    const current = this.keyState.get(key) || false;
    const prev = this.prevKeyState(key);
    return current && !prev;
  }

  private prevKeyState(key: string): boolean {
    // Check previous frame state
    const action = Array.from(this.keyBindings.entries()).find(
      ([, k]) => k === key
    )?.[0];
    if (!action) return false;

    return this.prevState[action as keyof InputState] || false;
  }

  shouldMove(action: 'left' | 'right' | 'down'): boolean {
    if (!this.isActionDown(action)) return false;

    const timer = this.dasTimers.get(action) || 0;

    // First press
    if (timer === 0) return true;

    // DAS delay
    if (timer < this.dasDelay) return false;

    // ARR (Auto Repeat Rate)
    const repeatTime = timer - this.dasDelay;
    return repeatTime % this.dasRepeat < 0.016; // ~1 frame tolerance
  }

  getState(): InputState {
    return this.currentState;
  }

  rebind(action: InputAction, key: string): void {
    this.keyBindings.set(action, key);
  }

  getBinding(action: InputAction): string | undefined {
    return this.keyBindings.get(action);
  }

  private createEmptyState(): InputState {
    return {
      left: false,
      right: false,
      down: false,
      hardDrop: false,
      rotateCW: false,
      rotateCCW: false,
      rotate180: false,
      hold: false,
    };
  }

  destroy(): void {
    window.removeEventListener('keydown', (e) => this.onKeyDown(e));
    window.removeEventListener('keyup', (e) => this.onKeyUp(e));
  }
}
