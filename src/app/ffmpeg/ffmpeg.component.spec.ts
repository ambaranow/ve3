import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FfmpegComponent } from './ffmpeg.component';

describe('FfmpegComponent', () => {
  let component: FfmpegComponent;
  let fixture: ComponentFixture<FfmpegComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FfmpegComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FfmpegComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
