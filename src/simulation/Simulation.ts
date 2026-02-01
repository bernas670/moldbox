import { AgentData } from './Agent';
import { TrailMap } from './TrailMap';
import type { SimulationParams } from './SimulationParams';
import { DEFAULT_PARAMS, degToRad } from './SimulationParams';
import { WebGLRenderer } from '../rendering/WebGLRenderer';

export class Simulation {
  private canvas: HTMLCanvasElement;
  private renderer: WebGLRenderer;
  private agents: AgentData;
  private trailMap: TrailMap;
  private params: SimulationParams;

  // Simulation dimensions (square for simplicity)
  private simWidth: number;
  private simHeight: number;

  private running: boolean = false;
  private animationId: number = 0;
  private frameCount: number = 0;
  private fpsTime: number = 0;
  private currentFps: number = 0;

  private onFpsUpdate?: (fps: number) => void;

  constructor(canvas: HTMLCanvasElement, params: Partial<SimulationParams> = {}) {
    this.canvas = canvas;
    this.params = { ...DEFAULT_PARAMS, ...params };

    // Get WebGL2 context
    const gl = canvas.getContext('webgl2', {
      alpha: false,
      antialias: false,
      preserveDrawingBuffer: false,
    });

    if (!gl) {
      throw new Error('WebGL2 not supported');
    }

    // Initialize at configured resolution
    this.simWidth = this.params.resolution;
    this.simHeight = this.params.resolution;

    this.renderer = new WebGLRenderer(gl, this.simWidth, this.simHeight);
    this.agents = new AgentData(this.params.agentCount, this.simWidth, this.simHeight);
    this.trailMap = new TrailMap(this.simWidth, this.simHeight);

    // Start with agents in a circle for interesting initial patterns
    this.agents.initializeCircle(this.simWidth, this.simHeight);

    console.log('Simulation initialized:', {
      resolution: this.params.resolution,
      agentCount: this.params.agentCount,
    });
  }

  /**
   * Main simulation step
   */
  private step(): void {
    const { params, agents, trailMap, simWidth, simHeight } = this;

    // Convert angles from degrees to radians
    const sensorAngleRad = degToRad(params.sensorAngle);
    const turnSpeedRad = degToRad(params.turnSpeed);

    // Update each agent
    for (let i = 0; i < agents.count; i++) {
      let x = agents.positions[i * 2];
      let y = agents.positions[i * 2 + 1];
      let angle = agents.angles[i];

      // Sample sensors
      const sensorDist = params.sensorDistance;

      // Front-left sensor
      const leftAngle = angle - sensorAngleRad;
      const leftX = x + Math.cos(leftAngle) * sensorDist;
      const leftY = y + Math.sin(leftAngle) * sensorDist;
      const leftSample = trailMap.sample(leftX, leftY);

      // Front sensor
      const frontX = x + Math.cos(angle) * sensorDist;
      const frontY = y + Math.sin(angle) * sensorDist;
      const frontSample = trailMap.sample(frontX, frontY);

      // Front-right sensor
      const rightAngle = angle + sensorAngleRad;
      const rightX = x + Math.cos(rightAngle) * sensorDist;
      const rightY = y + Math.sin(rightAngle) * sensorDist;
      const rightSample = trailMap.sample(rightX, rightY);

      // Decide turn direction
      if (frontSample > leftSample && frontSample > rightSample) {
        // Go straight (no turn)
      } else if (frontSample < leftSample && frontSample < rightSample) {
        // Random turn when front is weakest
        angle += (Math.random() < 0.5 ? -1 : 1) * turnSpeedRad;
      } else if (leftSample > rightSample) {
        // Turn left
        angle -= turnSpeedRad;
      } else if (rightSample > leftSample) {
        // Turn right
        angle += turnSpeedRad;
      } else {
        // Add small random perturbation for tie-breaking
        angle += (Math.random() - 0.5) * turnSpeedRad * 0.5;
      }

      // Move forward
      x += Math.cos(angle) * params.moveSpeed;
      y += Math.sin(angle) * params.moveSpeed;

      // Wrap at edges
      if (x < 0) x += simWidth;
      if (x >= simWidth) x -= simWidth;
      if (y < 0) y += simHeight;
      if (y >= simHeight) y -= simHeight;

      // Update agent state
      agents.positions[i * 2] = x;
      agents.positions[i * 2 + 1] = y;
      agents.angles[i] = angle;

      // Deposit pheromone
      trailMap.deposit(x, y, params.depositAmount);
    }

    // CPU-based trail processing
    trailMap.diffuse(params.diffusionRate);
    trailMap.decay(params.decayRate);

    // Render to screen
    this.renderer.render(trailMap.data);
  }

  /**
   * Animation loop
   */
  private loop = (time: number): void => {
    if (!this.running) return;

    // FPS calculation
    this.frameCount++;
    if (time - this.fpsTime >= 1000) {
      this.currentFps = this.frameCount;
      this.frameCount = 0;
      this.fpsTime = time;
      this.onFpsUpdate?.(this.currentFps);
    }

    this.step();
    this.animationId = requestAnimationFrame(this.loop);
  };

  /**
   * Start simulation
   */
  start(): void {
    if (this.running) return;
    this.running = true;
    this.fpsTime = performance.now();
    this.frameCount = 0;
    this.animationId = requestAnimationFrame(this.loop);
  }

  /**
   * Stop simulation
   */
  stop(): void {
    this.running = false;
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = 0;
    }
  }

  /**
   * Toggle pause/resume
   */
  toggle(): void {
    if (this.running) {
      this.stop();
    } else {
      this.start();
    }
  }

  /**
   * Reset simulation
   */
  reset(): void {
    this.agents.reset(this.params.agentCount, this.simWidth, this.simHeight);
    this.agents.initializeCircle(this.simWidth, this.simHeight);
    this.trailMap.clear();
  }

  /**
   * Resize canvas (simulation resolution stays fixed)
   */
  resize(width: number, height: number): void {
    this.canvas.width = width;
    this.canvas.height = height;
  }

  /**
   * Update parameters
   */
  updateParams(newParams: Partial<SimulationParams>): void {
    const prevAgentCount = this.params.agentCount;
    const prevResolution = this.params.resolution;
    Object.assign(this.params, newParams);

    // Handle resolution change
    if (newParams.resolution !== undefined && newParams.resolution !== prevResolution) {
      this.setResolution(this.params.resolution);
      return; // setResolution already resets agents
    }

    // Recreate agents if count changed
    if (newParams.agentCount !== undefined && newParams.agentCount !== prevAgentCount) {
      this.agents = new AgentData(
        this.params.agentCount,
        this.simWidth,
        this.simHeight
      );
      this.agents.initializeCircle(this.simWidth, this.simHeight);
    }
  }

  /**
   * Change simulation resolution
   */
  private setResolution(resolution: number): void {
    this.simWidth = resolution;
    this.simHeight = resolution;

    // Recreate renderer, trail map, and agents
    this.renderer.resize(resolution, resolution);
    this.trailMap.resize(resolution, resolution);
    this.agents = new AgentData(this.params.agentCount, resolution, resolution);
    this.agents.initializeCircle(resolution, resolution);

    console.log('Resolution changed to:', resolution);
  }

  /**
   * Get current parameters
   */
  getParams(): SimulationParams {
    return { ...this.params };
  }

  /**
   * Set FPS update callback
   */
  setFpsCallback(callback: (fps: number) => void): void {
    this.onFpsUpdate = callback;
  }

  /**
   * Get trail map for external drawing
   */
  getTrailMap(): TrailMap {
    return this.trailMap;
  }

  /**
   * Get simulation dimensions
   */
  getSimDimensions(): { width: number; height: number } {
    return { width: this.simWidth, height: this.simHeight };
  }

  /**
   * Check if simulation is running
   */
  isRunning(): boolean {
    return this.running;
  }

  /**
   * Get current FPS
   */
  getFps(): number {
    return this.currentFps;
  }
}
