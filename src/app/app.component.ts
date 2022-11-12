import { Component, HostListener } from '@angular/core';
import { ParametersService } from './parameters.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'charge-simulation';
  showToolbar = false
  colorAtPointer?: {r: number, g: number, b: number}

  get notFullScreen(): boolean {
    return document.fullscreenElement == null
  }

  @HostListener('document:keypress', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) { 
    if (event.key == "f") {
      if (this.notFullScreen) {
        this.openFullscreen()
      } else {
        this.closeFullscreen()
      }
    }
  }

  constructor(public parametersService: ParametersService) {
  }

  getVector() {
    var vector = this.parametersService.getVector(this.colorAtPointer)
    return {
      x: vector?.x ?? 0,
      y: vector?.y ?? 0
    }
  }

  openFullscreen() {
    document.documentElement.requestFullscreen();
  }

  closeFullscreen() {
    document.exitFullscreen();
  }
}
