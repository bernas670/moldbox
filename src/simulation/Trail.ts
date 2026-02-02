export interface TrailParams {
  name: string;
  color: [number, number, number];
  diffusionRate: number;
  decayRate: number;
}

export const DEFAULT_TRAIL_PARAMS: Omit<TrailParams, 'name' | 'color'> = {
  diffusionRate: 0.1,
  decayRate: 0.98,
};

export class Trail {
  params: TrailParams;
  data: Float32Array;
  private buffer: Float32Array;
  private width: number;
  private height: number;

  constructor(params: TrailParams, width: number, height: number) {
    this.params = { ...params };
    this.width = width;
    this.height = height;
    this.data = new Float32Array(width * height);
    this.buffer = new Float32Array(width * height);
  }

  private index(x: number, y: number): number {
    return y * this.width + x;
  }

  sample(x: number, y: number): number {
    const ix = Math.floor(x);
    const iy = Math.floor(y);
    if (ix < 0 || ix >= this.width || iy < 0 || iy >= this.height) {
      return 0;
    }
    return this.data[this.index(ix, iy)];
  }

  deposit(x: number, y: number, amount: number): void {
    const ix = Math.floor(x);
    const iy = Math.floor(y);
    if (ix < 0 || ix >= this.width || iy < 0 || iy >= this.height) {
      return;
    }
    this.data[this.index(ix, iy)] += amount;
  }

  diffuse(): void {
    const { width, height, data, buffer, params } = this;
    const rate = params.diffusionRate;

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        let sum = 0;
        let count = 0;

        for (let dy = -1; dy <= 1; dy++) {
          for (let dx = -1; dx <= 1; dx++) {
            const nx = x + dx;
            const ny = y + dy;
            if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
              sum += data[this.index(nx, ny)];
              count++;
            }
          }
        }

        const idx = this.index(x, y);
        const center = data[idx];
        const avg = sum / count;
        buffer[idx] = center + (avg - center) * rate;
      }
    }

    this.data.set(buffer);
  }

  decay(): void {
    const rate = this.params.decayRate;
    for (let i = 0; i < this.data.length; i++) {
      this.data[i] *= rate;
    }
  }

  clear(): void {
    this.data.fill(0);
  }

  resize(width: number, height: number): void {
    this.width = width;
    this.height = height;
    this.data = new Float32Array(width * height);
    this.buffer = new Float32Array(width * height);
  }

  drawCircle(x: number, y: number, radius: number, amount: number): void {
    const r2 = radius * radius;
    const minX = Math.max(0, Math.floor(x - radius));
    const maxX = Math.min(this.width - 1, Math.ceil(x + radius));
    const minY = Math.max(0, Math.floor(y - radius));
    const maxY = Math.min(this.height - 1, Math.ceil(y + radius));

    for (let py = minY; py <= maxY; py++) {
      for (let px = minX; px <= maxX; px++) {
        const dx = px - x;
        const dy = py - y;
        if (dx * dx + dy * dy <= r2) {
          this.data[this.index(px, py)] += amount;
        }
      }
    }
  }

  eraseCircle(x: number, y: number, radius: number): void {
    const r2 = radius * radius;
    const minX = Math.max(0, Math.floor(x - radius));
    const maxX = Math.min(this.width - 1, Math.ceil(x + radius));
    const minY = Math.max(0, Math.floor(y - radius));
    const maxY = Math.min(this.height - 1, Math.ceil(y + radius));

    for (let py = minY; py <= maxY; py++) {
      for (let px = minX; px <= maxX; px++) {
        const dx = px - x;
        const dy = py - y;
        if (dx * dx + dy * dy <= r2) {
          this.data[this.index(px, py)] = 0;
        }
      }
    }
  }
}

export const TRAIL_COLORS: [number, number, number][] = [
  [0.0, 0.8, 0.9],   // Cyan
  [0.9, 0.3, 0.1],   // Orange
  [0.2, 0.9, 0.3],   // Green
  [0.9, 0.2, 0.6],   // Pink
  [0.6, 0.4, 0.9],   // Purple
  [0.9, 0.9, 0.2],   // Yellow
];
