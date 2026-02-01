/**
 * TrailMap maintains trail data and performs CPU-based processing.
 */
export class TrailMap {
  width: number;
  height: number;
  data: Float32Array;
  private buffer: Float32Array;  // Double buffer for diffusion

  constructor(width: number, height: number) {
    this.width = width;
    this.height = height;
    this.data = new Float32Array(width * height);
    this.buffer = new Float32Array(width * height);
  }

  private index(x: number, y: number): number {
    return y * this.width + x;
  }

  /**
   * Get trail value at position (with bounds checking)
   */
  sample(x: number, y: number): number {
    const ix = Math.floor(x);
    const iy = Math.floor(y);

    if (ix < 0 || ix >= this.width || iy < 0 || iy >= this.height) {
      return 0;
    }

    return this.data[this.index(ix, iy)];
  }

  /**
   * Add deposit at position
   */
  deposit(x: number, y: number, amount: number): void {
    const ix = Math.floor(x);
    const iy = Math.floor(y);

    if (ix < 0 || ix >= this.width || iy < 0 || iy >= this.height) {
      return;
    }

    this.data[this.index(ix, iy)] += amount;
  }

  /**
   * Apply diffusion (blur) to trail
   */
  diffuse(rate: number): void {
    const { width, height, data, buffer } = this;

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        let sum = 0;
        let count = 0;

        // Sample 3x3 neighborhood
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

        const center = data[this.index(x, y)];
        const avg = sum / count;
        buffer[this.index(x, y)] = center + (avg - center) * rate;
      }
    }

    // Swap buffers
    this.data.set(buffer);
  }

  /**
   * Apply decay to trail
   */
  decay(rate: number): void {
    const { data } = this;
    for (let i = 0; i < data.length; i++) {
      data[i] *= rate;
    }
  }

  /**
   * Resize the trail map
   */
  resize(width: number, height: number): void {
    this.width = width;
    this.height = height;
    this.data = new Float32Array(width * height);
    this.buffer = new Float32Array(width * height);
  }

  /**
   * Clear all trail data
   */
  clear(): void {
    this.data.fill(0);
  }

  /**
   * Draw a circle of trail at position
   */
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

  /**
   * Erase a circle of trail at position
   */
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
