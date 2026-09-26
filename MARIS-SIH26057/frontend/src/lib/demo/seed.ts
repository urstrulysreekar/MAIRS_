/**
 * Deterministic Pseudo-Random Number Generator (PRNG) using SplitMix32 / Mulberry32.
 * Ensures identical demo data across browser sessions and repeatable demonstrations.
 */

export class SeededPRNG {
  private s: number;

  constructor(seed: number = 26057) {
    this.s = Math.floor(seed) | 0;
  }

  /** Returns pseudo-random float in [0, 1) */
  next(): number {
    let t = (this.s += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }

  /** Float in [min, max) */
  float(min: number, max: number): number {
    return min + this.next() * (max - min);
  }

  /** Integer in [min, max] */
  int(min: number, max: number): number {
    return Math.floor(this.float(min, max + 1));
  }

  /** Pick one random item from array */
  pick<T>(array: T[]): T {
    return array[this.int(0, array.length - 1)];
  }

  /** Pick one item weighted by probability array */
  weightedPick<T>(items: T[], weights: number[]): T {
    const totalWeight = weights.reduce((sum, w) => sum + w, 0);
    let rand = this.float(0, totalWeight);
    for (let i = 0; i < items.length; i++) {
      if (rand < weights[i]) return items[i];
      rand -= weights[i];
    }
    return items[items.length - 1];
  }

  /** Gaussian-like distribution around mean */
  gaussian(mean: number, stdev: number): number {
    const u = 1 - this.next();
    const v = this.next();
    const z = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
    return mean + z * stdev;
  }
}
