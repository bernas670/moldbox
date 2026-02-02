export interface SimulationParams {
  // Trail behavior (global)
  diffusionRate: number;
  decayRate: number;

  // Simulation scale (percentage of canvas size, 50-100)
  resolutionScale: number;
}

export const DEFAULT_PARAMS: SimulationParams = {
  diffusionRate: 0.1,
  decayRate: 0.98,
  resolutionScale: 50,
};

// Convert degrees to radians
export function degToRad(degrees: number): number {
  return degrees * (Math.PI / 180);
}
