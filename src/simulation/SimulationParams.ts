export interface SimulationParams {
  // Trail behavior (global)
  diffusionRate: number;
  decayRate: number;

  // Simulation scale
  resolution: number;
}

export const DEFAULT_PARAMS: SimulationParams = {
  diffusionRate: 0.1,
  decayRate: 0.98,
  resolution: 400,
};

// Convert degrees to radians
export function degToRad(degrees: number): number {
  return degrees * (Math.PI / 180);
}
