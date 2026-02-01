export interface SimulationParams {
  // Agent sensing
  sensorAngle: number;      // Angle between sensors (degrees)
  sensorDistance: number;   // Distance to sensors (pixels)

  // Agent movement
  turnSpeed: number;        // Max turn per step (degrees)
  moveSpeed: number;        // Pixels per step

  // Trail behavior
  depositAmount: number;    // Pheromone deposited per step
  diffusionRate: number;    // Spread to neighbors (0-1)
  decayRate: number;        // Decay multiplier per frame (0-1)

  // Simulation scale
  agentCount: number;       // Number of agents
  resolution: number;       // Simulation resolution (width & height)
}

export const DEFAULT_PARAMS: SimulationParams = {
  sensorAngle: 45,
  sensorDistance: 9,
  turnSpeed: 45,
  moveSpeed: 1,
  depositAmount: 5,
  diffusionRate: 0.1,
  decayRate: 0.98,
  agentCount: 10000,
  resolution: 400,
};

// Convert degrees to radians
export function degToRad(degrees: number): number {
  return degrees * (Math.PI / 180);
}
