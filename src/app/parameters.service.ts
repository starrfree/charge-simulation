import { Injectable } from '@angular/core';

type Preset = 'oscillation' | 'oscillation & movement' | 'circular'

@Injectable({
  providedIn: 'root'
})
export class ParametersService {
  parameters: {
    preset: Preset,
    expressionX: string,
    expressionY: string,
  }
  possiblePresets: Preset[] = ['oscillation', 'oscillation & movement', 'circular']
  resetSimulation: () => void = () => {}

  constructor() {
    this.parameters = {
      preset: 'oscillation & movement',
      expressionX: "",
      expressionY: "",
    }
    this.preset(this.parameters.preset)
  }

  preset(name: string | Preset) {
    this.parameters.preset = name as Preset
    switch (name) {
      case 'oscillation':
        this.parameters.expressionX = "0"
        this.parameters.expressionY = "0.03 * sin(2 * PI * 3 * t)"
        break;
      case 'oscillation & movement':
        this.parameters.expressionX = "1.3 * sin(2 * PI * 0.11 * t)"
        this.parameters.expressionY = "0.04 * sin(2 * PI * 3 * t)"
        break;
      case 'circular':
        this.parameters.expressionX = "0.03 * cos(2 * PI * 3 * t)"
        this.parameters.expressionY = "0.03 * sin(2 * PI * 3 * t)"
        break;
      default:
        break;
    }
    this.resetSimulation()
  }

  getTitle(preset: Preset): string {
    switch (preset) {
      case 'oscillation':
        return "Oscillating"
      case 'oscillation & movement':
        return "Oscillating and moving"
      case 'circular':
        return "Circular motion"
      default:
        return ""
    }
  }

  getExpression(preset: Preset): { x: string, y: string } {
    switch (preset) {
      case 'oscillation':
        return {
          x: "0",
          y: "0.03 * sin(2 * PI * 3 * t)"
        }
      case 'oscillation & movement':
        return {
          x: "1.3 * sin(2 * PI * 0.11 * t)",
          y: "0.04 * sin(2 * PI * 3 * t)"
        }
      case 'circular':
        return {
          x: "0.03 * cos(2 * PI * 3 * t)",
          y: "0.03 * sin(2 * PI * 3 * t)"
        }
      default:
        return {
          x: "0",
          y: "0"
        }
    }
  }
}
