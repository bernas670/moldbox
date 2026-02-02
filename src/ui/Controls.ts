import GUI from 'lil-gui';
import { Simulation } from '../simulation/Simulation';
import type { SimulationParams } from '../simulation/SimulationParams';
import type { Species } from '../simulation/Species';
import type { Trail } from '../simulation/Trail';

export type DrawMode = 'draw' | 'erase';

export interface ControlState {
  drawMode: DrawMode;
  brushRadius: number;
  selectedTrailIndex: number;
}

export class Controls {
  private gui: GUI;
  private simulation: Simulation;
  private params: SimulationParams;
  private controlState: ControlState;
  private fpsDisplay: { fps: string };
  private speciesFolders: GUI[] = [];
  private speciesContainer!: GUI;
  private trailFolders: GUI[] = [];
  private trailsContainer!: GUI;
  private interactionFolder!: GUI;
  private trailDrawController: ReturnType<GUI['add']> | null = null;

  constructor(simulation: Simulation) {
    this.simulation = simulation;
    this.params = simulation.getParams();
    this.controlState = {
      drawMode: 'draw',
      brushRadius: 20,
      selectedTrailIndex: 0,
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

    simulation.setTrailChangeCallback(() => {
      this.rebuildTrailsUI();
      this.rebuildSpeciesUI(); // Species dropdowns depend on trails
      this.rebuildTrailDrawDropdown(); // Draw dropdown depends on trails
    });
  }

  private setupControls(): void {
    // Performance folder
    const perfFolder = this.gui.addFolder('Performance');
    perfFolder.add(this.fpsDisplay, 'fps').name('Frame Rate').disable();
    perfFolder
      .add(this.params, 'resolutionScale', 25, 100, 5)
      .name('Resolution Scale %')
      .onChange((value: number) => {
        this.simulation.updateParams({ resolutionScale: value });
      });

    // Trails container
    this.trailsContainer = this.gui.addFolder('Trails');
    this.rebuildTrailsUI();

    // Add trail button
    const trailActions = {
      addTrail: () => {
        this.simulation.addTrail();
      },
    };
    this.trailsContainer.add(trailActions, 'addTrail').name('+ Add Trail');

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
    this.interactionFolder = this.gui.addFolder('Interaction');
    this.interactionFolder
      .add(this.controlState, 'drawMode', ['draw', 'erase'])
      .name('Draw Mode');
    this.interactionFolder
      .add(this.controlState, 'brushRadius', 5, 100, 1)
      .name('Brush Radius');

    // Trail selector for drawing
    this.rebuildTrailDrawDropdown();

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
    this.trailsContainer.open();
    this.speciesContainer.open();
  }

  private rebuildTrailDrawDropdown(): void {
    // Remove old controller if exists
    if (this.trailDrawController) {
      this.trailDrawController.destroy();
    }

    const trailNames = this.simulation.getTrailNames();
    const options: Record<string, number> = {};
    trailNames.forEach((name, index) => {
      options[name] = index;
    });

    // Clamp selected index to valid range
    if (this.controlState.selectedTrailIndex >= trailNames.length) {
      this.controlState.selectedTrailIndex = 0;
    }

    this.trailDrawController = this.interactionFolder
      .add(this.controlState, 'selectedTrailIndex', options)
      .name('Draw on Trail');
  }

  private rebuildTrailsUI(): void {
    // Remove old trail folders
    for (const folder of this.trailFolders) {
      folder.destroy();
    }
    this.trailFolders = [];

    // Create folders for each trail
    const trailList = this.simulation.getTrails();
    for (let i = 0; i < trailList.length; i++) {
      const trail = trailList[i];
      const folder = this.createTrailFolder(trail, i);
      this.trailFolders.push(folder);
    }
  }

  private createTrailFolder(trail: Trail, index: number): GUI {
    const folder = this.trailsContainer.addFolder(trail.params.name);
    const params = trail.params;

    // Name
    folder.add(params, 'name').name('Name').onChange((value: string) => {
      folder.title(value);
    });

    // Color
    const colorObj = { color: this.rgbToHex(params.color) };
    folder.addColor(colorObj, 'color').name('Color').onChange((value: string) => {
      params.color = this.hexToRgb(value);
    });

    // Diffusion rate
    folder.add(params, 'diffusionRate', 0, 0.5, 0.01).name('Diffusion Rate');

    // Decay rate
    folder.add(params, 'decayRate', 0.9, 1, 0.001).name('Decay Rate');

    // Remove button (only if more than 1 trail)
    if (this.simulation.getTrails().length > 1) {
      const removeAction = {
        remove: () => {
          this.simulation.removeTrail(index);
        },
      };
      folder.add(removeAction, 'remove').name('Remove Trail');
    }

    folder.open();
    return folder;
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

    // Agent count
    folder.add(params, 'agentCount', 100, 20000, 100).name('Agents').onChange((value: number) => {
      this.simulation.updateSpeciesParams(index, { agentCount: value });
    });

    // Trail selection dropdowns
    const trailNames = this.simulation.getTrailNames();
    const trailOptions: Record<string, number> = {};
    trailNames.forEach((name, i) => {
      trailOptions[name] = i;
    });

    folder.add(params, 'followTrailIndex', trailOptions).name('Follow Trail');
    folder.add(params, 'depositTrailIndex', trailOptions).name('Deposit Trail');

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
