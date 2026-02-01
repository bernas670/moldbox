/**
 * Agent data using Structure of Arrays (SoA) pattern for better cache performance.
 * Each agent has a position (x, y) and angle (direction facing).
 */
export class AgentData {
  positions: Float32Array;  // [x0, y0, x1, y1, ...]
  angles: Float32Array;     // [angle0, angle1, ...]
  count: number;

  constructor(count: number, width: number, height: number) {
    this.count = count;
    this.positions = new Float32Array(count * 2);
    this.angles = new Float32Array(count);

    this.initializeRandom(width, height);
  }

  /**
   * Initialize agents in a circular pattern at the center, facing outward
   */
  initializeCircle(width: number, height: number): void {
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(width, height) * 0.3;

    for (let i = 0; i < this.count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const r = Math.sqrt(Math.random()) * radius;

      this.positions[i * 2] = centerX + Math.cos(angle) * r;
      this.positions[i * 2 + 1] = centerY + Math.sin(angle) * r;
      // Face toward center
      this.angles[i] = angle + Math.PI;
    }
  }

  /**
   * Initialize agents randomly across the canvas
   */
  initializeRandom(width: number, height: number): void {
    for (let i = 0; i < this.count; i++) {
      this.positions[i * 2] = Math.random() * width;
      this.positions[i * 2 + 1] = Math.random() * height;
      this.angles[i] = Math.random() * Math.PI * 2;
    }
  }

  /**
   * Initialize agents in a ring pattern
   */
  initializeRing(width: number, height: number): void {
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(width, height) * 0.4;

    for (let i = 0; i < this.count; i++) {
      const angle = (i / this.count) * Math.PI * 2;
      const offset = (Math.random() - 0.5) * 20;

      this.positions[i * 2] = centerX + Math.cos(angle) * (radius + offset);
      this.positions[i * 2 + 1] = centerY + Math.sin(angle) * (radius + offset);
      // Face toward center
      this.angles[i] = angle + Math.PI;
    }
  }

  /**
   * Get position of agent at index
   */
  getPosition(index: number): [number, number] {
    return [this.positions[index * 2], this.positions[index * 2 + 1]];
  }

  /**
   * Set position of agent at index
   */
  setPosition(index: number, x: number, y: number): void {
    this.positions[index * 2] = x;
    this.positions[index * 2 + 1] = y;
  }

  /**
   * Reset agents with new count
   */
  reset(count: number, width: number, height: number): void {
    if (count !== this.count) {
      this.count = count;
      this.positions = new Float32Array(count * 2);
      this.angles = new Float32Array(count);
    }
    this.initializeRandom(width, height);
  }
}
