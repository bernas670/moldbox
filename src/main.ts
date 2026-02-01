import './style.css';
import { Simulation } from './simulation/Simulation';
import { Controls } from './ui/Controls';
import { InteractionHandler } from './ui/InteractionHandler';

function init() {
  const app = document.getElementById('app')!;

  // Create canvas
  const canvas = document.createElement('canvas');
  canvas.id = 'canvas';
  app.appendChild(canvas);

  // Set canvas size to window size
  function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  resizeCanvas();

  // Create instructions overlay
  const instructions = document.createElement('div');
  instructions.id = 'instructions';
  instructions.innerHTML = `
    <kbd>Space</kbd> Pause/Resume &nbsp;
    <kbd>R</kbd> Reset &nbsp;
    <kbd>1</kbd> Draw &nbsp;
    <kbd>2</kbd> Erase &nbsp;
    <kbd>Click & Drag</kbd> Paint trails
  `;
  document.body.appendChild(instructions);

  // Initialize simulation
  let simulation: Simulation;
  let controls: Controls;

  try {
    simulation = new Simulation(canvas);
    controls = new Controls(simulation);
    new InteractionHandler(canvas, simulation, controls);

    // Handle window resize
    let resizeTimeout: number;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = window.setTimeout(() => {
        resizeCanvas();
        simulation.resize(canvas.width, canvas.height);
      }, 100);
    });

    // Start simulation
    simulation.start();

  } catch (error) {
    console.error('Failed to initialize simulation:', error);
    app.innerHTML = `
      <div style="color: #ff4444; font-family: monospace; padding: 20px; text-align: center;">
        <h2>WebGL2 Error</h2>
        <p>${error instanceof Error ? error.message : 'Unknown error'}</p>
        <p style="margin-top: 10px; color: #888;">
          This simulation requires WebGL2 with float texture support.
        </p>
      </div>
    `;
  }
}

// Wait for DOM to be ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
