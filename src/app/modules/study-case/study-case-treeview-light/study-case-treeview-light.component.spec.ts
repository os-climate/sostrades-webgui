import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { StudyCaseTreeviewLightComponent } from './study-case-treeview-light.component';

describe('StudyCaseTreeviewLightComponent', () => {
  let component: StudyCaseTreeviewLightComponent;
  let fixture: ComponentFixture<StudyCaseTreeviewLightComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ StudyCaseTreeviewLightComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StudyCaseTreeviewLightComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
