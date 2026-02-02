export interface SimulationParams {
  // Simulation scale (percentage of canvas size, 25-100)
  resolutionScale: number;
  // Edge behavior: true = wrap around (toroidal), false = bounded
  wrapEdges: boolean;
}

export const DEFAULT_PARAMS: SimulationParams = {
  resolutionScale: 50,
  wrapEdges: true,
};

// Convert degrees to radians
export function degToRad(degrees: number): number {
  return degrees * (Math.PI / 180);
}
