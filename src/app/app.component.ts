import { Component, HostListener } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'charge-simulation';

  @HostListener('document:keypress', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) { 
    if (event.key == "f") {
      if (document.fullscreenElement == null) {
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
