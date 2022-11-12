import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ParametersService } from '../parameters.service';

declare function checkExpression(t: number, expression: string): boolean;

@Component({
  selector: 'app-toolbar',
  templateUrl: './toolbar.component.html',
  styleUrls: ['./toolbar.component.css']
})
export class ToolbarComponent implements OnInit {
  @Output() escape = new EventEmitter()
  @Input() colorAtPointer?: {r: number, g: number, b: number}

  expressionX: string = ""
  expressionY: string = ""

  constructor(public parametersService: ParametersService) { }

  ngOnInit(): void {
    const setExpressions = () => {
      this.expressionX = this.parametersService.parameters.expressionX
      this.expressionY = this.parametersService.parameters.expressionY
    }
    setExpressions()
    this.parametersService.onURLChange = setExpressions
  }

  setPreset(preset: string) {
    this.parametersService.preset(preset)
    this.parametersService.setURL()
    this.expressionX = this.parametersService.parameters.expressionX
    this.expressionY = this.parametersService.parameters.expressionY
  }

  getVector(): {x: number, y: number} | undefined {
    if (this.colorAtPointer == undefined) {
      return undefined
    }
    var hsv = this.rgbToHsv(this.colorAtPointer.r, this.colorAtPointer.g, this.colorAtPointer.b)
    var r = 2.0 * hsv.v
    return {
      x: r * Math.cos(hsv.h * 2 * Math.PI),
      y: -r * Math.sin(hsv.h * 2 * Math.PI)
    }
  }

  setX() {
    if (this.parametersService.parameters.expressionX == this.expressionX) {
      return
    }
    if (checkExpression(0, this.expressionX)) {
      this.parametersService.parameters.expressionX = this.expressionX
      if (this.parametersService.parameters.preset == 'custom') {
        this.parametersService.defaultCustomExpression.x = this.expressionX
      }
      this.parametersService.setURL()
      this.parametersService.resetSimulation()
    }
  }

  setY() {
    if (this.parametersService.parameters.expressionY == this.expressionY) {
      return
    }
    if (checkExpression(0, this.expressionY)) {
      this.parametersService.parameters.expressionY = this.expressionY
      if (this.parametersService.parameters.preset == 'custom') {
        this.parametersService.defaultCustomExpression.y = this.expressionY
      }
      this.parametersService.setURL()
      this.parametersService.resetSimulation()
    }
  }

  blur() {
    (document.activeElement as HTMLElement).blur();
    window.onblur = function () {
      (document.activeElement as HTMLElement).blur();
    };
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
