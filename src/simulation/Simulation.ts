import { TrailMap } from './TrailMap';
import type { SimulationParams } from './SimulationParams';
import { DEFAULT_PARAMS, degToRad } from './SimulationParams';
import type { SpeciesParams } from './Species';
import { Species, SPECIES_COLORS, DEFAULT_SPECIES_PARAMS } from './Species';
import { WebGLRenderer } from '../rendering/WebGLRenderer';

export class Simulation {
  private canvas: HTMLCanvasElement;
  private renderer: WebGLRenderer;
  private species: Species[] = [];
  private trailMap: TrailMap;
  private params: SimulationParams;

  private simWidth: number;
  private simHeight: number;

  private running: boolean = false;
  private animationId: number = 0;
  private frameCount: number = 0;
  private fpsTime: number = 0;
  private currentFps: number = 0;

  private onFpsUpdate?: (fps: number) => void;
  private onSpeciesChange?: () => void;

  constructor(canvas: HTMLCanvasElement, params: Partial<SimulationParams> = {}) {
    this.canvas = canvas;
    this.params = { ...DEFAULT_PARAMS, ...params };

    const gl = canvas.getContext('webgl2', {
      alpha: false,
      antialias: false,
      preserveDrawingBuffer: false,
    });

    if (!gl) {
      throw new Error('WebGL2 not supported');
    }

    this.simWidth = this.params.resolution;
    this.simHeight = this.params.resolution;

    this.renderer = new WebGLRenderer(gl, this.simWidth, this.simHeight);
    this.trailMap = new TrailMap(this.simWidth, this.simHeight);

    // Create default species
    this.addSpecies({
      name: 'Species 1',
      color: SPECIES_COLORS[0],
      ...DEFAULT_SPECIES_PARAMS,
    });
  }

  private step(): void {
    const { params, trailMap, simWidth, simHeight } = this;

    // Update each species
    for (const sp of this.species) {
      const { agents, params: spParams } = sp;
      const sensorAngleRad = degToRad(spParams.sensorAngle);
      const turnSpeedRad = degToRad(spParams.turnSpeed);
      const color = spParams.color;

      for (let i = 0; i < agents.count; i++) {
        let x = agents.positions[i * 2];
        let y = agents.positions[i * 2 + 1];
        let angle = agents.angles[i];

        const sensorDist = spParams.sensorDistance;

        // Sample sensors
        const leftAngle = angle - sensorAngleRad;
        const leftSample = trailMap.sample(
          x + Math.cos(leftAngle) * sensorDist,
          y + Math.sin(leftAngle) * sensorDist
        );

        const frontSample = trailMap.sample(
          x + Math.cos(angle) * sensorDist,
          y + Math.sin(angle) * sensorDist
        );

        const rightAngle = angle + sensorAngleRad;
        const rightSample = trailMap.sample(
          x + Math.cos(rightAngle) * sensorDist,
          y + Math.sin(rightAngle) * sensorDist
        );

        // Decide turn direction
        if (frontSample > leftSample && frontSample > rightSample) {
          // Go straight
        } else if (frontSample < leftSample && frontSample < rightSample) {
          angle += (Math.random() < 0.5 ? -1 : 1) * turnSpeedRad;
        } else if (leftSample > rightSample) {
          angle -= turnSpeedRad;
        } else if (rightSample > leftSample) {
          angle += turnSpeedRad;
        } else {
          angle += (Math.random() - 0.5) * turnSpeedRad * 0.5;
        }

        // Move forward
        x += Math.cos(angle) * spParams.moveSpeed;
        y += Math.sin(angle) * spParams.moveSpeed;

        // Wrap at edges
        if (x < 0) x += simWidth;
        if (x >= simWidth) x -= simWidth;
        if (y < 0) y += simHeight;
        if (y >= simHeight) y -= simHeight;

        agents.positions[i * 2] = x;
        agents.positions[i * 2 + 1] = y;
        agents.angles[i] = angle;

        // Deposit colored pheromone
        trailMap.deposit(x, y, color, spParams.depositAmount);
      }
    }

    trailMap.diffuse(params.diffusionRate);
    trailMap.decay(params.decayRate);
    this.renderer.render(trailMap.data);
  }

  private loop = (time: number): void => {
    if (!this.running) return;

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

  start(): void {
    if (this.running) return;
    this.running = true;
    this.fpsTime = performance.now();
    this.frameCount = 0;
    this.animationId = requestAnimationFrame(this.loop);
  }

  stop(): void {
    this.running = false;
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = 0;
    }
  }

  toggle(): void {
    if (this.running) this.stop();
    else this.start();
  }

  reset(): void {
    for (const sp of this.species) {
      sp.reset(this.simWidth, this.simHeight);
    }
    this.trailMap.clear();
  }

  resize(width: number, height: number): void {
    this.canvas.width = width;
    this.canvas.height = height;
  }

  // Species management
  addSpecies(params?: Partial<SpeciesParams>): Species {
    const index = this.species.length;
    const fullParams: SpeciesParams = {
      name: `Species ${index + 1}`,
      color: SPECIES_COLORS[index % SPECIES_COLORS.length],
      ...DEFAULT_SPECIES_PARAMS,
      ...params,
    };

    const sp = new Species(fullParams, this.simWidth, this.simHeight);
    this.species.push(sp);
    this.onSpeciesChange?.();
    return sp;
  }

  removeSpecies(index: number): void {
    if (this.species.length > 1 && index >= 0 && index < this.species.length) {
      this.species.splice(index, 1);
      this.onSpeciesChange?.();
    }
  }

  getSpecies(): Species[] {
    return this.species;
  }

  updateSpeciesParams(index: number, params: Partial<SpeciesParams>): void {
    const sp = this.species[index];
    if (!sp) return;

    const prevCount = sp.params.agentCount;
    Object.assign(sp.params, params);

    if (params.agentCount !== undefined && params.agentCount !== prevCount) {
      sp.updateAgentCount(params.agentCount, this.simWidth, this.simHeight);
    }
  }

  // Global params
  updateParams(newParams: Partial<SimulationParams>): void {
    const prevResolution = this.params.resolution;
    Object.assign(this.params, newParams);

    if (newParams.resolution !== undefined && newParams.resolution !== prevResolution) {
      this.setResolution(this.params.resolution);
    }
  }

  private setResolution(resolution: number): void {
    this.simWidth = resolution;
    this.simHeight = resolution;

    this.renderer.resize(resolution, resolution);
    this.trailMap.resize(resolution, resolution);

    for (const sp of this.species) {
      sp.reset(resolution, resolution);
    }
  }

  getParams(): SimulationParams {
    return { ...this.params };
  }

  setFpsCallback(callback: (fps: number) => void): void {
    this.onFpsUpdate = callback;
  }

  setSpeciesChangeCallback(callback: () => void): void {
    this.onSpeciesChange = callback;
  }

  getTrailMap(): TrailMap {
    return this.trailMap;
  }

  getSimDimensions(): { width: number; height: number } {
    return { width: this.simWidth, height: this.simHeight };
  }

  isRunning(): boolean {
    return this.running;
  }

  getFps(): number {
    return this.currentFps;
  }
}
