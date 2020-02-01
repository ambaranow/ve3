import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { KeyframesLineComponent } from './keyframes-line.component';

describe('KeyframesLineComponent', () => {
  let component: KeyframesLineComponent;
  let fixture: ComponentFixture<KeyframesLineComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ KeyframesLineComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(KeyframesLineComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
