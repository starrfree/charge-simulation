import { Component, HostListener } from '@angular/core';

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

  openFullscreen() {
    document.documentElement.requestFullscreen();
  }

  closeFullscreen() {
    document.exitFullscreen();
  }
}
