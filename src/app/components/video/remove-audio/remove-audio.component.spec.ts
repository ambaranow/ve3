import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RemoveAudioComponent } from './remove-audio.component';

describe('RemoveAudioComponent', () => {
  let component: RemoveAudioComponent;
  let fixture: ComponentFixture<RemoveAudioComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RemoveAudioComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RemoveAudioComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
