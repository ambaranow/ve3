import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { VideoReverseComponent } from './video-reverse.component';

describe('VideoReverseComponent', () => {
  let component: VideoReverseComponent;
  let fixture: ComponentFixture<VideoReverseComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ VideoReverseComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(VideoReverseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
