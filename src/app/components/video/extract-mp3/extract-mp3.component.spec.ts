import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ExtractMp3Component } from './extract-mp3.component';

describe('ExtractMp3Component', () => {
  let component: ExtractMp3Component;
  let fixture: ComponentFixture<ExtractMp3Component>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ExtractMp3Component ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ExtractMp3Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
