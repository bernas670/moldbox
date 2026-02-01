import GUI from 'lil-gui';
import { Simulation } from '../simulation/Simulation';
import type { SimulationParams } from '../simulation/SimulationParams';
import type { Species } from '../simulation/Species';
import { SPECIES_COLORS } from '../simulation/Species';

export type DrawMode = 'draw' | 'erase';

export interface ControlState {
  drawMode: DrawMode;
  brushRadius: number;
  drawColor: [number, number, number];
}

export class Controls {
  private gui: GUI;
  private simulation: Simulation;
  private params: SimulationParams;
  private controlState: ControlState;
  private fpsDisplay: { fps: string };
  private speciesFolders: GUI[] = [];
  private speciesContainer!: GUI;

  constructor(simulation: Simulation) {
    this.simulation = simulation;
    this.params = simulation.getParams();
    this.controlState = {
      drawMode: 'draw',
      brushRadius: 20,
      drawColor: SPECIES_COLORS[0],
    };
    this.fpsDisplay = { fps: '0 FPS' };

    this.gui = new GUI({ title: 'Slime Mold Simulation' });
    this.setupControls();

    simulation.setFpsCallback((fps) => {
      this.fpsDisplay.fps = `${fps} FPS`;
    });

    simulation.setSpeciesChangeCallback(() => {
      this.rebuildSpeciesUI();
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

    // Trail folder (global settings)
    const trailFolder = this.gui.addFolder('Trail (Global)');
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

    // Species container
    this.speciesContainer = this.gui.addFolder('Species');
    this.rebuildSpeciesUI();

    // Add species button
    const speciesActions = {
      addSpecies: () => {
        this.simulation.addSpecies();
      },
    };
    this.speciesContainer.add(speciesActions, 'addSpecies').name('+ Add Species');

    // Interaction folder
    const interactionFolder = this.gui.addFolder('Interaction');
    interactionFolder
      .add(this.controlState, 'drawMode', ['draw', 'erase'])
      .name('Draw Mode');
    interactionFolder
      .add(this.controlState, 'brushRadius', 5, 100, 1)
      .name('Brush Radius');

    // Color picker for drawing
    const colorObj = { color: this.rgbToHex(this.controlState.drawColor) };
    interactionFolder
      .addColor(colorObj, 'color')
      .name('Draw Color')
      .onChange((value: string) => {
        this.controlState.drawColor = this.hexToRgb(value);
      });

    // Actions folder
    const actionsFolder = this.gui.addFolder('Actions');
    const actions = {
      pause: () => this.simulation.toggle(),
      reset: () => this.simulation.reset(),
    };
    actionsFolder.add(actions, 'pause').name('Pause / Resume (Space)');
    actionsFolder.add(actions, 'reset').name('Reset (R)');

    // Open important folders
    perfFolder.open();
    trailFolder.open();
    this.speciesContainer.open();
  }

  private rebuildSpeciesUI(): void {
    // Remove old species folders
    for (const folder of this.speciesFolders) {
      folder.destroy();
    }
    this.speciesFolders = [];

    // Create folders for each species
    const speciesList = this.simulation.getSpecies();
    for (let i = 0; i < speciesList.length; i++) {
      const sp = speciesList[i];
      const folder = this.createSpeciesFolder(sp, i);
      this.speciesFolders.push(folder);
    }
  }

  private createSpeciesFolder(species: Species, index: number): GUI {
    const folder = this.speciesContainer.addFolder(species.params.name);
    const params = species.params;

    // Name
    folder.add(params, 'name').name('Name').onChange((value: string) => {
      folder.title(value);
    });

    // Color
    const colorObj = { color: this.rgbToHex(params.color) };
    folder.addColor(colorObj, 'color').name('Color').onChange((value: string) => {
      params.color = this.hexToRgb(value);
    });

    // Agent count
    folder.add(params, 'agentCount', 100, 20000, 100).name('Agents').onChange((value: number) => {
      this.simulation.updateSpeciesParams(index, { agentCount: value });
    });

    // Sensor settings
    folder.add(params, 'sensorAngle', 10, 90, 1).name('Sensor Angle');
    folder.add(params, 'sensorDistance', 1, 30, 1).name('Sensor Distance');

    // Movement
    folder.add(params, 'turnSpeed', 5, 180, 1).name('Turn Speed');
    folder.add(params, 'moveSpeed', 0.5, 5, 0.1).name('Move Speed');

    // Deposit
    folder.add(params, 'depositAmount', 1, 20, 0.5).name('Deposit Amount');

    // Remove button (only if more than 1 species)
    if (this.simulation.getSpecies().length > 1) {
      const removeAction = {
        remove: () => {
          this.simulation.removeSpecies(index);
        },
      };
      folder.add(removeAction, 'remove').name('Remove Species');
    }

    folder.open();
    return folder;
  }

  private rgbToHex(rgb: [number, number, number]): string {
    const r = Math.round(rgb[0] * 255);
    const g = Math.round(rgb[1] * 255);
    const b = Math.round(rgb[2] * 255);
    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
  }

  private hexToRgb(hex: string): [number, number, number] {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    if (result) {
      return [
        parseInt(result[1], 16) / 255,
        parseInt(result[2], 16) / 255,
        parseInt(result[3], 16) / 255,
      ];
    }
    return [1, 1, 1];
  }

  getControlState(): ControlState {
    return this.controlState;
  }

  destroy(): void {
    this.gui.destroy();
  }
}
