// Visual effects system - particle effects, flashes, and animations

import * as PIXI from 'pixi.js';
import { snap } from '@/utils/math';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  color: number;
  size: number;
}

export class VFX {
  private container: PIXI.Container;
  private graphics: PIXI.Graphics;
  private particles: Particle[] = [];
  private flashes: Array<{ alpha: number; color: number }> = [];

  constructor() {
    this.container = new PIXI.Container();
    this.graphics = new PIXI.Graphics();
    this.container.addChild(this.graphics);
  }

  // Line clear flash effect
  lineClearFlash(lines: number[], wellX: number, wellY: number): void {
    const cellSize = 8;
    const wellWidth = 10 * cellSize;

    lines.forEach((lineY) => {
      const y = wellY + lineY * cellSize;

      // Add flash overlay
      this.flashes.push({
        alpha: 0.8,
        color: 0x00e0ff,
      });

      // Spawn particles along the line
      for (let i = 0; i < 20; i++) {
        const x = wellX + Math.random() * wellWidth;
        const angle = (Math.random() - 0.5) * Math.PI;
        const speed = 20 + Math.random() * 40;

        this.particles.push({
          x,
          y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed - 30,
          life: 1.0,
          maxLife: 1.0,
          color: 0x00e0ff,
          size: 1 + Math.random() * 2,
        });
      }
    });
  }

  // Piece lock impact
  pieceLockImpact(x: number, y: number, color: number): void {
    // Small particle burst
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2;
      const speed = 15 + Math.random() * 15;

      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 0.5,
        maxLife: 0.5,
        color,
        size: 1,
      });
    }
  }

  // Prime clear celebration
  primeClearEffect(wellX: number, wellY: number): void {
    const cellSize = 8;
    const wellWidth = 10 * cellSize;
    const wellHeight = 20 * cellSize;

    // Big flash
    this.flashes.push({
      alpha: 1.0,
      color: 0x96f03c, // Green prime color
    });

    // Explosion of particles from center
    const centerX = wellX + wellWidth / 2;
    const centerY = wellY + wellHeight / 2;

    for (let i = 0; i < 50; i++) {
      const angle = (i / 50) * Math.PI * 2;
      const speed = 40 + Math.random() * 60;

      this.particles.push({
        x: centerX,
        y: centerY,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 1.5,
        maxLife: 1.5,
        color: i % 2 === 0 ? 0x96f03c : 0x00e0ff,
        size: 2 + Math.random() * 2,
      });
    }
  }

  // Perfect clear effect
  perfectClearEffect(wellX: number, wellY: number): void {
    const wellWidth = 10 * 8; // 10 cells × 8 pixels

    // Massive flash
    this.flashes.push({
      alpha: 1.0,
      color: 0xffbd2e, // Gold perfect clear color
    });

    // Rain of particles from top
    for (let i = 0; i < 100; i++) {
      const x = wellX + Math.random() * wellWidth;
      const y = wellY - 20 - Math.random() * 40;

      this.particles.push({
        x,
        y,
        vx: (Math.random() - 0.5) * 20,
        vy: 50 + Math.random() * 50,
        life: 2.0,
        maxLife: 2.0,
        color: i % 3 === 0 ? 0xffbd2e : i % 3 === 1 ? 0x00e0ff : 0x96f03c,
        size: 2 + Math.random() * 3,
      });
    }
  }

  // Update and render effects
  update(dt: number): void {
    this.graphics.clear();

    // Update flashes
    this.flashes = this.flashes.filter((flash) => {
      flash.alpha -= dt * 4; // Fade out quickly
      return flash.alpha > 0;
    });

    // Draw flashes (fullscreen)
    this.flashes.forEach((flash) => {
      this.graphics.beginFill(flash.color, flash.alpha * 0.3);
      this.graphics.drawRect(0, 0, 384, 216); // Fullscreen
      this.graphics.endFill();
    });

    // Update particles
    this.particles = this.particles.filter((p) => {
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.vy += 100 * dt; // Gravity
      p.life -= dt;
      return p.life > 0;
    });

    // Draw particles
    this.particles.forEach((p) => {
      const alpha = p.life / p.maxLife;
      this.graphics.beginFill(p.color, alpha);
      this.graphics.drawRect(snap(p.x), snap(p.y), p.size, p.size);
      this.graphics.endFill();
    });
  }

  getContainer(): PIXI.Container {
    return this.container;
  }

  destroy(): void {
    this.container.destroy({ children: true });
  }
}
