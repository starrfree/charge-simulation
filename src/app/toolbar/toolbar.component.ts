import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ParametersService } from '../parameters.service';

@Component({
  selector: 'app-toolbar',
  templateUrl: './toolbar.component.html',
  styleUrls: ['./toolbar.component.css']
})
export class ToolbarComponent implements OnInit {
  @Output() escape = new EventEmitter()
  @Input() colorAtPointer?: {r: number, g: number, b: number}

  constructor(public parametersService: ParametersService) { }

  ngOnInit(): void {
  }

  setPreset(preset: string) {
    this.parametersService.preset(preset)
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
