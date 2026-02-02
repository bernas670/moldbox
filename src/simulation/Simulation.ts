import type { SimulationParams } from './SimulationParams';
import { DEFAULT_PARAMS, degToRad } from './SimulationParams';
import type { SpeciesParams } from './Species';
import { Species, DEFAULT_SPECIES_PARAMS } from './Species';
import type { TrailParams } from './Trail';
import { Trail, TRAIL_COLORS, DEFAULT_TRAIL_PARAMS } from './Trail';
import { WebGLRenderer } from '../rendering/WebGLRenderer';

export interface SimulationConfig {
  name: string;
  createdAt: string;
  params: SimulationParams;
  trails: TrailParams[];
  species: SpeciesParams[];
}

export class Simulation {
  private canvas: HTMLCanvasElement;
  private renderer: WebGLRenderer;
  private species: Species[] = [];
  private trails: Trail[] = [];
  private compositeData: Float32Array;
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
  private onTrailChange?: () => void;

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

    const { width, height } = this.calculateResolution();
    this.simWidth = width;
    this.simHeight = height;
    this.compositeData = new Float32Array(width * height * 3);

    this.renderer = new WebGLRenderer(gl, this.simWidth, this.simHeight);

    // Create default trail
    this.addTrail({
      name: 'Trail 1',
      color: TRAIL_COLORS[0],
      ...DEFAULT_TRAIL_PARAMS,
    });

    // Create default species
    this.addSpecies({
      name: 'Species 1',
      ...DEFAULT_SPECIES_PARAMS,
    });
  }

  private calculateResolution(): { width: number; height: number } {
    const scale = this.params.resolutionScale / 100;
    return {
      width: Math.floor(this.canvas.width * scale),
      height: Math.floor(this.canvas.height * scale),
    };
  }

  private compositeTrails(): void {
    // Clear composite
    this.compositeData.fill(0);

    // Add each trail's contribution
    for (const trail of this.trails) {
      const color = trail.params.color;
      const data = trail.data;

      for (let i = 0; i < data.length; i++) {
        const value = data[i];
        const idx = i * 3;
        this.compositeData[idx] += color[0] * value;
        this.compositeData[idx + 1] += color[1] * value;
        this.compositeData[idx + 2] += color[2] * value;
      }
    }
  }

  private step(): void {
    const { simWidth, simHeight, params } = this;
    const wrap = params.wrapEdges;

    // Update each species
    for (const sp of this.species) {
      const { agents, params: spParams } = sp;
      const sensorAngleRad = degToRad(spParams.sensorAngle);
      const turnSpeedRad = degToRad(spParams.turnSpeed);

      // Get the trails this species interacts with
      const followTrail = this.trails[spParams.followTrailIndex];
      const depositTrail = this.trails[spParams.depositTrailIndex];

      if (!followTrail || !depositTrail) continue;

      for (let i = 0; i < agents.count; i++) {
        let x = agents.positions[i * 2];
        let y = agents.positions[i * 2 + 1];
        let angle = agents.angles[i];

        const sensorDist = spParams.sensorDistance;

        // Sample sensors from the follow trail (with wrap mode)
        const leftAngle = angle - sensorAngleRad;
        const leftSample = followTrail.sample(
          x + Math.cos(leftAngle) * sensorDist,
          y + Math.sin(leftAngle) * sensorDist,
          wrap
        );

        const frontSample = followTrail.sample(
          x + Math.cos(angle) * sensorDist,
          y + Math.sin(angle) * sensorDist,
          wrap
        );

        const rightAngle = angle + sensorAngleRad;
        const rightSample = followTrail.sample(
          x + Math.cos(rightAngle) * sensorDist,
          y + Math.sin(rightAngle) * sensorDist,
          wrap
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
        let newX = x + Math.cos(angle) * spParams.moveSpeed;
        let newY = y + Math.sin(angle) * spParams.moveSpeed;

        if (wrap) {
          // Wrap at edges (toroidal)
          if (newX < 0) newX += simWidth;
          if (newX >= simWidth) newX -= simWidth;
          if (newY < 0) newY += simHeight;
          if (newY >= simHeight) newY -= simHeight;
          x = newX;
          y = newY;
        } else {
          // Bounded mode: bounce off edges
          if (newX < 0 || newX >= simWidth) {
            angle = Math.PI - angle; // Reflect horizontally
            newX = Math.max(0, Math.min(simWidth - 0.01, newX));
          }
          if (newY < 0 || newY >= simHeight) {
            angle = -angle; // Reflect vertically
            newY = Math.max(0, Math.min(simHeight - 0.01, newY));
          }
          x = newX;
          y = newY;
        }

        agents.positions[i * 2] = x;
        agents.positions[i * 2 + 1] = y;
        agents.angles[i] = angle;

        // Deposit pheromone on the deposit trail
        depositTrail.deposit(x, y, spParams.depositAmount);
      }
    }

    // Process each trail
    for (const trail of this.trails) {
      trail.diffuse();
      trail.decay();
    }

    // Composite all trails and render
    this.compositeTrails();
    this.renderer.render(this.compositeData);
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
    for (const trail of this.trails) {
      trail.clear();
    }
  }

  resize(width: number, height: number): void {
    this.canvas.width = width;
    this.canvas.height = height;
    this.applyResolution();
  }

  private applyResolution(): void {
    const { width, height } = this.calculateResolution();

    if (width === this.simWidth && height === this.simHeight) {
      return;
    }

    this.simWidth = width;
    this.simHeight = height;
    this.compositeData = new Float32Array(width * height * 3);

    this.renderer.resize(width, height);

    for (const trail of this.trails) {
      trail.resize(width, height);
    }

    for (const sp of this.species) {
      sp.reset(width, height);
    }
  }

  // Trail management
  addTrail(params?: Partial<TrailParams>): Trail {
    const index = this.trails.length;
    const fullParams: TrailParams = {
      name: `Trail ${index + 1}`,
      color: TRAIL_COLORS[index % TRAIL_COLORS.length],
      ...DEFAULT_TRAIL_PARAMS,
      ...params,
    };

    const trail = new Trail(fullParams, this.simWidth, this.simHeight);
    this.trails.push(trail);
    this.onTrailChange?.();
    return trail;
  }

  removeTrail(index: number): void {
    if (this.trails.length > 1 && index >= 0 && index < this.trails.length) {
      this.trails.splice(index, 1);

      // Update species that referenced removed or higher indexed trails
      for (const sp of this.species) {
        if (sp.params.followTrailIndex >= this.trails.length) {
          sp.params.followTrailIndex = 0;
        }
        if (sp.params.depositTrailIndex >= this.trails.length) {
          sp.params.depositTrailIndex = 0;
        }
      }

      this.onTrailChange?.();
    }
  }

  getTrails(): Trail[] {
    return this.trails;
  }

  getTrailNames(): string[] {
    return this.trails.map(t => t.params.name);
  }

  updateTrailParams(index: number, params: Partial<TrailParams>): void {
    const trail = this.trails[index];
    if (trail) {
      Object.assign(trail.params, params);
    }
  }

  // Species management
  addSpecies(params?: Partial<SpeciesParams>): Species {
    const index = this.species.length;
    const fullParams: SpeciesParams = {
      name: `Species ${index + 1}`,
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
    Object.assign(this.params, newParams);

    if (newParams.resolutionScale !== undefined) {
      this.applyResolution();
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

  setTrailChangeCallback(callback: () => void): void {
    this.onTrailChange = callback;
  }

  getTrail(index: number): Trail | undefined {
    return this.trails[index];
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

  // Config export/import
  exportConfig(name: string): SimulationConfig {
    return {
      name,
      createdAt: new Date().toISOString(),
      params: { ...this.params },
      trails: this.trails.map(t => ({ ...t.params })),
      species: this.species.map(s => ({ ...s.params })),
    };
  }

  loadConfig(config: SimulationConfig): void {
    // Update simulation params
    Object.assign(this.params, config.params);
    this.applyResolution();

    // Clear existing trails and species
    this.trails = [];
    this.species = [];

    // Recreate trails
    for (const trailParams of config.trails) {
      const trail = new Trail({ ...trailParams }, this.simWidth, this.simHeight);
      this.trails.push(trail);
    }

    // Recreate species
    for (const speciesParams of config.species) {
      const sp = new Species({ ...speciesParams }, this.simWidth, this.simHeight);
      this.species.push(sp);
    }

    // Notify UI to rebuild
    this.onTrailChange?.();
    this.onSpeciesChange?.();
  }
}
