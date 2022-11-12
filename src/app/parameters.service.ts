import { Injectable } from '@angular/core';
import { Location } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';

type Preset = 'oscillation' | 'oscillation and movement' | 'circular' | 'custom'

@Injectable({
  providedIn: 'root'
})
export class ParametersService {
  parameters: {
    preset: Preset,
    expressionX: string,
    expressionY: string,
  }
  possiblePresets: Preset[] = ['oscillation', 'oscillation and movement', 'circular']
  resetSimulation: () => void = () => {}
  onURLChange: () => void = () => {}
  defaultCustomExpression = {
    x: "0",
    y: "0"
  }

  constructor(private location: Location, private router: Router, private activatedRoute: ActivatedRoute) {
    this.parameters = {
      preset: 'oscillation and movement',
      expressionX: "",
      expressionY: "",
    }
    this.getURL()
    this.preset(this.parameters.preset)
  }

  getURL() {
    this.activatedRoute.queryParamMap.subscribe((map: any) => {
      var params = map.params
      if (params['customX']) {
        this.defaultCustomExpression.x = params['customX']
      }
      if (params['customY']) {
        this.defaultCustomExpression.y = params['customY']
      }
      if (params['mvmt']) {
        this.preset(params['mvmt'])
      }
      this.onURLChange()
    })
  }

  setURL() {
    var params: any = {
      customX: this.defaultCustomExpression.x,
      customY: this.defaultCustomExpression.y,
      mvmt: this.parameters.preset
    }
    const url = this.router.createUrlTree([], {relativeTo: this.activatedRoute, queryParams: params}).toString()
    this.location.go(url);
  }

  preset(name: string | Preset) {
    this.parameters.preset = name as Preset
    switch (name) {
      case 'oscillation':
        this.parameters.expressionX = "0"
        this.parameters.expressionY = "0.03 * sin(2 * PI * 3 * t)"
        break;
      case 'oscillation and movement':
        this.parameters.expressionX = "1.3 * sin(2 * PI * 0.11 * t)"
        this.parameters.expressionY = "0.04 * sin(2 * PI * 3 * t)"
        break;
      case 'circular':
        this.parameters.expressionX = "0.03 * cos(2 * PI * 3 * t)"
        this.parameters.expressionY = "0.03 * sin(2 * PI * 3 * t)"
        break;
      default:
        this.parameters.expressionX = this.defaultCustomExpression.x
        this.parameters.expressionY = this.defaultCustomExpression.y
        break;
    }
    this.resetSimulation()
  }

  getTitle(preset: Preset): string {
    switch (preset) {
      case 'oscillation':
        return "Oscillating"
      case 'oscillation and movement':
        return "Oscillating and moving"
      case 'circular':
        return "Circular motion"
      default:
        return ""
    }
  }
}
