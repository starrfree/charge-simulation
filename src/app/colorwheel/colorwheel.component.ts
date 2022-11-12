import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-colorwheel',
  templateUrl: './colorwheel.component.html',
  styleUrls: ['./colorwheel.component.css']
})
export class ColorwheelComponent implements OnInit {
  @Input() x: number = 0
  @Input() y: number = 0

  constructor() { }

  ngOnInit(): void {
  }

}
