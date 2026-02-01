import { AgentData } from './Agent';

export interface SpeciesParams {
  name: string;
  color: [number, number, number]; // RGB 0-1
  agentCount: number;
  sensorAngle: number;
  sensorDistance: number;
  turnSpeed: number;
  moveSpeed: number;
  depositAmount: number;
}

export const DEFAULT_SPECIES_PARAMS: Omit<SpeciesParams, 'name' | 'color'> = {
  agentCount: 5000,
  sensorAngle: 45,
  sensorDistance: 9,
  turnSpeed: 45,
  moveSpeed: 1,
  depositAmount: 5,
};

export class Species {
  params: SpeciesParams;
  agents: AgentData;

  constructor(params: SpeciesParams, width: number, height: number) {
    this.params = { ...params };
    this.agents = new AgentData(params.agentCount, width, height);
    this.agents.initializeCircle(width, height);
  }

  updateAgentCount(count: number, width: number, height: number): void {
    if (count !== this.params.agentCount) {
      this.params.agentCount = count;
      this.agents = new AgentData(count, width, height);
      this.agents.initializeCircle(width, height);
    }
  }

  reset(width: number, height: number): void {
    this.agents.reset(this.params.agentCount, width, height);
    this.agents.initializeCircle(width, height);
  }
}

// Predefined color palette for new species
export const SPECIES_COLORS: [number, number, number][] = [
  [0.0, 0.8, 0.9],   // Cyan
  [0.9, 0.3, 0.1],   // Orange
  [0.2, 0.9, 0.3],   // Green
  [0.9, 0.2, 0.6],   // Pink
  [0.6, 0.4, 0.9],   // Purple
  [0.9, 0.9, 0.2],   // Yellow
];

export function createDefaultSpecies(): SpeciesParams {
  return {
    name: 'Species 1',
    color: [0.0, 0.8, 0.9],
    ...DEFAULT_SPECIES_PARAMS,
  };
}
