/**
 * TrailMap maintains RGB trail data and performs CPU-based processing.
 * Each pixel has 3 channels (R, G, B) for colored trails.
 */
export class TrailMap {
  width: number;
  height: number;
  data: Float32Array;      // RGB interleaved: [r0, g0, b0, r1, g1, b1, ...]
  private buffer: Float32Array;

  constructor(width: number, height: number) {
    this.width = width;
    this.height = height;
    this.data = new Float32Array(width * height * 3);
    this.buffer = new Float32Array(width * height * 3);
  }

  private index(x: number, y: number): number {
    return (y * this.width + x) * 3;
  }

  /**
   * Get trail intensity at position (sum of RGB for sensing)
   */
  sample(x: number, y: number): number {
    const ix = Math.floor(x);
    const iy = Math.floor(y);

    if (ix < 0 || ix >= this.width || iy < 0 || iy >= this.height) {
      return 0;
    }

    const idx = this.index(ix, iy);
    return this.data[idx] + this.data[idx + 1] + this.data[idx + 2];
  }

  /**
   * Sample specific color channel at position
   */
  sampleChannel(x: number, y: number, channel: number): number {
    const ix = Math.floor(x);
    const iy = Math.floor(y);

    if (ix < 0 || ix >= this.width || iy < 0 || iy >= this.height) {
      return 0;
    }

    return this.data[this.index(ix, iy) + channel];
  }

  /**
   * Add colored deposit at position
   */
  deposit(x: number, y: number, color: [number, number, number], amount: number): void {
    const ix = Math.floor(x);
    const iy = Math.floor(y);

    if (ix < 0 || ix >= this.width || iy < 0 || iy >= this.height) {
      return;
    }

    const idx = this.index(ix, iy);
    this.data[idx] += color[0] * amount;
    this.data[idx + 1] += color[1] * amount;
    this.data[idx + 2] += color[2] * amount;
  }

  /**
   * Apply diffusion (blur) to trail - all channels
   */
  diffuse(rate: number): void {
    const { width, height, data, buffer } = this;

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const centerIdx = this.index(x, y);

        for (let c = 0; c < 3; c++) {
          let sum = 0;
          let count = 0;

          // Sample 3x3 neighborhood
          for (let dy = -1; dy <= 1; dy++) {
            for (let dx = -1; dx <= 1; dx++) {
              const nx = x + dx;
              const ny = y + dy;
              if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
                sum += data[this.index(nx, ny) + c];
                count++;
              }
            }
          }

          const center = data[centerIdx + c];
          const avg = sum / count;
          buffer[centerIdx + c] = center + (avg - center) * rate;
        }
      }
    }

    // Swap buffers
    this.data.set(buffer);
  }

  /**
   * Apply decay to trail - all channels
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
    this.data = new Float32Array(width * height * 3);
    this.buffer = new Float32Array(width * height * 3);
  }

  /**
   * Clear all trail data
   */
  clear(): void {
    this.data.fill(0);
  }

  /**
   * Draw a circle of colored trail at position
   */
  drawCircle(x: number, y: number, radius: number, color: [number, number, number], amount: number): void {
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
          const idx = this.index(px, py);
          this.data[idx] += color[0] * amount;
          this.data[idx + 1] += color[1] * amount;
          this.data[idx + 2] += color[2] * amount;
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
          const idx = this.index(px, py);
          this.data[idx] = 0;
          this.data[idx + 1] = 0;
          this.data[idx + 2] = 0;
        }
      }
    }
  }
}
