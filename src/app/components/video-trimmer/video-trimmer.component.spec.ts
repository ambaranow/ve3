import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { VideoTrimmerComponent } from './video-trimmer.component';

describe('VideoTrimmerComponent', () => {
  let component: VideoTrimmerComponent;
  let fixture: ComponentFixture<VideoTrimmerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ VideoTrimmerComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(VideoTrimmerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
