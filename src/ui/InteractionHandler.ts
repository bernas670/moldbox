import { Simulation } from '../simulation/Simulation';
import { Controls } from './Controls';

export class InteractionHandler {
  private canvas: HTMLCanvasElement;
  private simulation: Simulation;
  private controls: Controls;

  private isDrawing: boolean = false;
  private lastX: number = 0;
  private lastY: number = 0;

  constructor(canvas: HTMLCanvasElement, simulation: Simulation, controls: Controls) {
    this.canvas = canvas;
    this.simulation = simulation;
    this.controls = controls;

    this.setupMouseEvents();
    this.setupTouchEvents();
    this.setupKeyboardEvents();
  }

  private getSimPosition(clientX: number, clientY: number): [number, number] {
    const rect = this.canvas.getBoundingClientRect();
    const simDims = this.simulation.getSimDimensions();

    // Convert from client coordinates to simulation coordinates
    const x = ((clientX - rect.left) / rect.width) * simDims.width;
    const y = ((clientY - rect.top) / rect.height) * simDims.height;

    return [x, y];
  }

  private handleDraw(x: number, y: number): void {
    const state = this.controls.getControlState();
    const trailMap = this.simulation.getTrailMap();
    const simDims = this.simulation.getSimDimensions();

    // Scale brush radius to simulation space
    const rect = this.canvas.getBoundingClientRect();
    const scale = simDims.width / rect.width;
    const radius = state.brushRadius * scale;

    switch (state.drawMode) {
      case 'draw':
        trailMap.drawCircle(x, y, radius, 50);
        break;
      case 'erase':
        trailMap.eraseCircle(x, y, radius);
        break;
      case 'spawn':
        // Spawn agents at position - not implemented yet
        break;
    }
  }

  private setupMouseEvents(): void {
    this.canvas.addEventListener('mousedown', (e) => {
      if (e.button !== 0) return; // Left click only
      this.isDrawing = true;
      const [x, y] = this.getSimPosition(e.clientX, e.clientY);
      this.lastX = x;
      this.lastY = y;
      this.handleDraw(x, y);
    });

    this.canvas.addEventListener('mousemove', (e) => {
      if (!this.isDrawing) return;
      const [x, y] = this.getSimPosition(e.clientX, e.clientY);

      // Interpolate between last position and current for smooth lines
      const dx = x - this.lastX;
      const dy = y - this.lastY;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const steps = Math.max(1, Math.floor(dist / 2));

      for (let i = 1; i <= steps; i++) {
        const t = i / steps;
        const ix = this.lastX + dx * t;
        const iy = this.lastY + dy * t;
        this.handleDraw(ix, iy);
      }

      this.lastX = x;
      this.lastY = y;
    });

    this.canvas.addEventListener('mouseup', () => {
      this.isDrawing = false;
    });

    this.canvas.addEventListener('mouseleave', () => {
      this.isDrawing = false;
    });
  }

  private setupTouchEvents(): void {
    this.canvas.addEventListener('touchstart', (e) => {
      e.preventDefault();
      if (e.touches.length !== 1) return;

      this.isDrawing = true;
      const touch = e.touches[0];
      const [x, y] = this.getSimPosition(touch.clientX, touch.clientY);
      this.lastX = x;
      this.lastY = y;
      this.handleDraw(x, y);
    }, { passive: false });

    this.canvas.addEventListener('touchmove', (e) => {
      e.preventDefault();
      if (!this.isDrawing || e.touches.length !== 1) return;

      const touch = e.touches[0];
      const [x, y] = this.getSimPosition(touch.clientX, touch.clientY);

      // Interpolate for smooth lines
      const dx = x - this.lastX;
      const dy = y - this.lastY;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const steps = Math.max(1, Math.floor(dist / 2));

      for (let i = 1; i <= steps; i++) {
        const t = i / steps;
        const ix = this.lastX + dx * t;
        const iy = this.lastY + dy * t;
        this.handleDraw(ix, iy);
      }

      this.lastX = x;
      this.lastY = y;
    }, { passive: false });

    this.canvas.addEventListener('touchend', () => {
      this.isDrawing = false;
    });

    this.canvas.addEventListener('touchcancel', () => {
      this.isDrawing = false;
    });
  }

  private setupKeyboardEvents(): void {
    document.addEventListener('keydown', (e) => {
      // Ignore if typing in an input
      if (e.target instanceof HTMLInputElement) return;

      switch (e.code) {
        case 'Space':
          e.preventDefault();
          this.simulation.toggle();
          break;
        case 'KeyR':
          e.preventDefault();
          this.simulation.reset();
          break;
        case 'Digit1':
          e.preventDefault();
          this.controls.getControlState().drawMode = 'draw';
          break;
        case 'Digit2':
          e.preventDefault();
          this.controls.getControlState().drawMode = 'erase';
          break;
        case 'Digit3':
          e.preventDefault();
          this.controls.getControlState().drawMode = 'spawn';
          break;
      }
    });
  }
}
