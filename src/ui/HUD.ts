// HUD - displays score, target, rev, credits, and breakdown

import * as PIXI from 'pixi.js';
import { GameState } from '@/types/game';
import { snap } from '@/utils/math';

export class HUD {
  private container: PIXI.Container;

  // Text elements
  private stageTotal: PIXI.Text;
  private target: PIXI.Text;
  private breakdown: PIXI.Text;
  private revDisplay: PIXI.Text;
  private creditsDisplay: PIXI.Text;
  private outcomePips: PIXI.Text;

  constructor() {
    this.container = new PIXI.Container();

    // Text style
    const titleStyle = new PIXI.TextStyle({
      fontFamily: 'monospace',
      fontSize: 10,
      fill: 0x9bb7ff,
    });

    const valueStyle = new PIXI.TextStyle({
      fontFamily: 'monospace',
      fontSize: 16,
      fill: 0xe6f2ff,
      fontWeight: 'bold',
    });

    const largeStyle = new PIXI.TextStyle({
      fontFamily: 'monospace',
      fontSize: 24,
      fill: 0xe6f2ff,
      fontWeight: 'bold',
    });

    const breakdownStyle = new PIXI.TextStyle({
      fontFamily: 'monospace',
      fontSize: 12,
      fill: 0xe6f2ff,
    });

    // Right panel (Score pane)
    const rightX = 280;
    let rightY = 20;

    // Stage Total (giant)
    const totalLabel = new PIXI.Text('STAGE TOTAL', titleStyle);
    totalLabel.x = snap(rightX);
    totalLabel.y = snap(rightY);
    this.container.addChild(totalLabel);
    rightY += 15;

    this.stageTotal = new PIXI.Text('0', largeStyle);
    this.stageTotal.x = snap(rightX);
    this.stageTotal.y = snap(rightY);
    this.container.addChild(this.stageTotal);
    rightY += 30;

    // Target
    const targetLabel = new PIXI.Text('TARGET', titleStyle);
    targetLabel.x = snap(rightX);
    targetLabel.y = snap(rightY);
    this.container.addChild(targetLabel);
    rightY += 15;

    this.target = new PIXI.Text('5000', valueStyle);
    this.target.x = snap(rightX);
    this.target.y = snap(rightY);
    this.container.addChild(this.target);
    rightY += 25;

    // Breakdown
    const breakdownLabel = new PIXI.Text('BREAKDOWN', titleStyle);
    breakdownLabel.x = snap(rightX);
    breakdownLabel.y = snap(rightY);
    this.container.addChild(breakdownLabel);
    rightY += 15;

    this.breakdown = new PIXI.Text('Base 0 × X ×1.0', breakdownStyle);
    this.breakdown.x = snap(rightX);
    this.breakdown.y = snap(rightY);
    this.container.addChild(this.breakdown);
    rightY += 20;

    // Rev
    const revLabel = new PIXI.Text('REV', titleStyle);
    revLabel.x = snap(rightX);
    revLabel.y = snap(rightY);
    this.container.addChild(revLabel);
    rightY += 15;

    this.revDisplay = new PIXI.Text('x1.0', valueStyle);
    this.revDisplay.x = snap(rightX);
    this.revDisplay.y = snap(rightY);
    this.container.addChild(this.revDisplay);
    rightY += 20;

    this.outcomePips = new PIXI.Text('• • •', breakdownStyle);
    this.outcomePips.x = snap(rightX);
    this.outcomePips.y = snap(rightY);
    this.container.addChild(this.outcomePips);
    rightY += 20;

    // Credits
    const creditsLabel = new PIXI.Text('CREDITS', titleStyle);
    creditsLabel.x = snap(rightX);
    creditsLabel.y = snap(rightY);
    this.container.addChild(creditsLabel);
    rightY += 15;

    this.creditsDisplay = new PIXI.Text('$ 0', valueStyle);
    this.creditsDisplay.x = snap(rightX);
    this.creditsDisplay.y = snap(rightY);
    this.container.addChild(this.creditsDisplay);
  }

  update(state: GameState): void {
    // Update stage total
    this.stageTotal.text = state.total.toString();

    // Update target
    this.target.text = state.target.toString();

    // Update breakdown (placeholder - will be dynamic with scoring)
    this.breakdown.text = `Base 0 × X ×${state.rev.toFixed(1)}`;

    // Update Rev
    this.revDisplay.text = `x${state.rev.toFixed(1)}`;

    // Update outcome pips
    const pipSymbols = state.lastOutcomes.map((outcome) => {
      if (outcome === 'prime') return '★';
      if (outcome === 'miss') return '✖';
      return '•';
    });
    // Pad with dots if less than 3
    while (pipSymbols.length < 3) {
      pipSymbols.unshift('•');
    }
    this.outcomePips.text = pipSymbols.join(' ');

    // Update credits
    this.creditsDisplay.text = `$ ${state.credits}`;
  }

  getContainer(): PIXI.Container {
    return this.container;
  }

  destroy(): void {
    this.container.destroy({ children: true });
  }
}
