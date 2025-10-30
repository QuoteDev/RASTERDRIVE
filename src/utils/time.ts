// Time utilities for game loop

export class Timer {
  private elapsed: number = 0;
  private duration: number;
  private callback: (() => void) | null = null;
  private loop: boolean = false;
  private active: boolean = false;

  constructor(duration: number, callback?: () => void, loop: boolean = false) {
    this.duration = duration;
    this.callback = callback || null;
    this.loop = loop;
  }

  start(): void {
    this.active = true;
    this.elapsed = 0;
  }

  stop(): void {
    this.active = false;
  }

  reset(): void {
    this.elapsed = 0;
  }

  update(dt: number): void {
    if (!this.active) return;

    this.elapsed += dt;
    if (this.elapsed >= this.duration) {
      this.callback?.();
      if (this.loop) {
        this.elapsed -= this.duration;
      } else {
        this.stop();
      }
    }
  }

  getProgress(): number {
    return Math.min(this.elapsed / this.duration, 1);
  }

  getRemaining(): number {
    return Math.max(this.duration - this.elapsed, 0);
  }

  isActive(): boolean {
    return this.active;
  }

  setDuration(duration: number): void {
    this.duration = duration;
  }
}
