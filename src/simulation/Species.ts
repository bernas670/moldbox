import { AgentData } from './Agent';

export interface SpeciesParams {
  name: string;
  agentCount: number;
  sensorAngle: number;
  sensorDistance: number;
  turnSpeed: number;
  moveSpeed: number;
  depositAmount: number;
  followTrailIndex: number;  // Which trail to sense/follow
  depositTrailIndex: number; // Which trail to deposit pheromones on
}

export const DEFAULT_SPECIES_PARAMS: Omit<SpeciesParams, 'name'> = {
  agentCount: 5000,
  sensorAngle: 45,
  sensorDistance: 9,
  turnSpeed: 45,
  moveSpeed: 1,
  depositAmount: 5,
  followTrailIndex: 0,
  depositTrailIndex: 0,
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
