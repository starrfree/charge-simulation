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
  
  getVector() {
    return this.parametersService.getVector(this.colorAtPointer)
  }

  blur() {
    (document.activeElement as HTMLElement).blur();
    window.onblur = function () {
      (document.activeElement as HTMLElement).blur();
    };
  }
}
