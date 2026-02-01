import GUI from 'lil-gui';
import { Simulation } from '../simulation/Simulation';
import type { SimulationParams } from '../simulation/SimulationParams';

export type DrawMode = 'draw' | 'erase' | 'spawn';

export interface ControlState {
  drawMode: DrawMode;
  brushRadius: number;
}

export class Controls {
  private gui: GUI;
  private simulation: Simulation;
  private params: SimulationParams;
  private controlState: ControlState;
  private fpsDisplay: { fps: string };

  constructor(simulation: Simulation) {
    this.simulation = simulation;
    this.params = simulation.getParams();
    this.controlState = {
      drawMode: 'draw',
      brushRadius: 20,
    };
    this.fpsDisplay = { fps: '0 FPS' };

    this.gui = new GUI({ title: 'Slime Mold Simulation' });
    this.setupControls();

    // Update FPS display
    simulation.setFpsCallback((fps) => {
      this.fpsDisplay.fps = `${fps} FPS`;
    });
  }

  private setupControls(): void {
    // Performance folder
    const perfFolder = this.gui.addFolder('Performance');
    perfFolder.add(this.fpsDisplay, 'fps').name('Frame Rate').disable();
    perfFolder
      .add(this.params, 'resolution', 200, 800, 50)
      .name('Resolution')
      .onChange((value: number) => {
        this.simulation.updateParams({ resolution: value });
      });

    // Agent folder
    const agentFolder = this.gui.addFolder('Agents');
    agentFolder
      .add(this.params, 'agentCount', 1000, 100000, 1000)
      .name('Agent Count')
      .onChange((value: number) => {
        this.simulation.updateParams({ agentCount: value });
      });

    agentFolder
      .add(this.params, 'sensorAngle', 10, 90, 1)
      .name('Sensor Angle')
      .onChange((value: number) => {
        this.simulation.updateParams({ sensorAngle: value });
      });

    agentFolder
      .add(this.params, 'sensorDistance', 1, 30, 1)
      .name('Sensor Distance')
      .onChange((value: number) => {
        this.simulation.updateParams({ sensorDistance: value });
      });

    agentFolder
      .add(this.params, 'turnSpeed', 5, 180, 1)
      .name('Turn Speed')
      .onChange((value: number) => {
        this.simulation.updateParams({ turnSpeed: value });
      });

    agentFolder
      .add(this.params, 'moveSpeed', 0.5, 5, 0.1)
      .name('Move Speed')
      .onChange((value: number) => {
        this.simulation.updateParams({ moveSpeed: value });
      });

    // Trail folder
    const trailFolder = this.gui.addFolder('Trail');
    trailFolder
      .add(this.params, 'depositAmount', 1, 20, 0.5)
      .name('Deposit Amount')
      .onChange((value: number) => {
        this.simulation.updateParams({ depositAmount: value });
      });

    trailFolder
      .add(this.params, 'diffusionRate', 0, 0.5, 0.01)
      .name('Diffusion Rate')
      .onChange((value: number) => {
        this.simulation.updateParams({ diffusionRate: value });
      });

    trailFolder
      .add(this.params, 'decayRate', 0.9, 1, 0.001)
      .name('Decay Rate')
      .onChange((value: number) => {
        this.simulation.updateParams({ decayRate: value });
      });

    // Interaction folder
    const interactionFolder = this.gui.addFolder('Interaction');
    interactionFolder
      .add(this.controlState, 'drawMode', ['draw', 'erase', 'spawn'])
      .name('Draw Mode');
    interactionFolder
      .add(this.controlState, 'brushRadius', 5, 100, 1)
      .name('Brush Radius');

    // Actions folder
    const actionsFolder = this.gui.addFolder('Actions');

    const actions = {
      pause: () => this.simulation.toggle(),
      reset: () => this.simulation.reset(),
      randomize: () => this.randomizeParams(),
      preset1: () => this.applyPreset('organic'),
      preset2: () => this.applyPreset('networks'),
      preset3: () => this.applyPreset('explosive'),
    };

    actionsFolder.add(actions, 'pause').name('Pause / Resume (Space)');
    actionsFolder.add(actions, 'reset').name('Reset (R)');
    actionsFolder.add(actions, 'randomize').name('Randomize');

    // Presets folder
    const presetsFolder = this.gui.addFolder('Presets');
    presetsFolder.add(actions, 'preset1').name('Organic');
    presetsFolder.add(actions, 'preset2').name('Networks');
    presetsFolder.add(actions, 'preset3').name('Explosive');

    // Open important folders by default
    perfFolder.open();
    agentFolder.open();
    trailFolder.open();
  }

  private randomizeParams(): void {
    const newParams: Partial<SimulationParams> = {
      sensorAngle: 20 + Math.random() * 70,
      sensorDistance: 3 + Math.random() * 25,
      turnSpeed: 10 + Math.random() * 80,
      depositAmount: 2 + Math.random() * 15,
      diffusionRate: Math.random() * 0.3,
      decayRate: 0.92 + Math.random() * 0.07,
    };

    this.simulation.updateParams(newParams);
    Object.assign(this.params, newParams);
    this.gui.controllersRecursive().forEach((c) => c.updateDisplay());
  }

  private applyPreset(name: 'organic' | 'networks' | 'explosive'): void {
    const presets: Record<string, Partial<SimulationParams>> = {
      organic: {
        sensorAngle: 45,
        sensorDistance: 9,
        turnSpeed: 45,
        moveSpeed: 1,
        depositAmount: 5,
        diffusionRate: 0.1,
        decayRate: 0.98,
      },
      networks: {
        sensorAngle: 22.5,
        sensorDistance: 15,
        turnSpeed: 22.5,
        moveSpeed: 1,
        depositAmount: 3,
        diffusionRate: 0.05,
        decayRate: 0.99,
      },
      explosive: {
        sensorAngle: 75,
        sensorDistance: 5,
        turnSpeed: 90,
        moveSpeed: 2,
        depositAmount: 10,
        diffusionRate: 0.2,
        decayRate: 0.95,
      },
    };

    const preset = presets[name];
    if (preset) {
      this.simulation.updateParams(preset);
      Object.assign(this.params, preset);
      this.gui.controllersRecursive().forEach((c) => c.updateDisplay());
    }
  }

  getControlState(): ControlState {
    return this.controlState;
  }

  destroy(): void {
    this.gui.destroy();
  }
}
