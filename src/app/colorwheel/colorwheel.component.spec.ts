import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ColorwheelComponent } from './colorwheel.component';

describe('ColorwheelComponent', () => {
  let component: ColorwheelComponent;
  let fixture: ComponentFixture<ColorwheelComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ColorwheelComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ColorwheelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
