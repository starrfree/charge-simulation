import { Injectable } from '@angular/core';
import { Location } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';

type Preset = 'oscillation' | 'oscillation and movement' | 'circular' | 'follow' | 'custom'

@Injectable({
  providedIn: 'root'
})
export class ParametersService {
  parameters: {
    preset: Preset,
    expressionX: string,
    expressionY: string,
    showWheel: boolean,
    field: 'electric' | 'poynting'
  }
  possiblePresets: Preset[] = ['oscillation', 'oscillation and movement', 'circular', 'follow']
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
      showWheel: true,
      field: 'electric'
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
      if (params['legend']) {
        this.parameters.showWheel = params['legend'] == 'true'
      }
      if (params['field']) {
        this.parameters.field = params['field']
      }
      this.onURLChange()
    })
  }

  setURL() {
    var params: any = {
      customX: this.defaultCustomExpression.x,
      customY: this.defaultCustomExpression.y,
      mvmt: this.parameters.preset,
      legend: this.parameters.showWheel,
      field: this.parameters.field,
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
      case 'follow':
        return "Follow mouse"
      default:
        return ""
    }
  }



  getVector(colorAtPointer: any): {x: number, y: number} | undefined {
    if (colorAtPointer == undefined) {
      return undefined
    }
    var hsv = this.rgbToHsv(colorAtPointer.r, colorAtPointer.g, colorAtPointer.b)
    var r = 2.0 * hsv.v
    return {
      x: r * Math.cos(hsv.h * 2 * Math.PI),
      y: r * Math.sin(hsv.h * 2 * Math.PI)
    }
  }

  rgbToHsv(r: number, g: number, b: number) {
    var max = Math.max(r, g, b), min = Math.min(r, g, b)
    var h, s, v = (max + min) / 2
    if(max == min){
        h = s = 0
    } else {
      var d = max - min
      s = v > 0.5 ? d / (2 - max - min) : d / (max + min)
      switch (max) {
        case r: 
          h = (g - b) / d + (g < b ? 6 : 0) 
          break
        case g: 
          h = (b - r) / d + 2 
          break
        case b: 
          h = (r - g) / d + 4 
          break
        default:
          h = 0
          break
      }
      h /= 6;
    }
    return {
      h: h,
      s: s,
      v: v
    }
  }
}
