import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { StudyCaseTreeviewComponent } from './study-case-treeview.component';

describe('StudyCaseTreeviewComponent', () => {
  let component: StudyCaseTreeviewComponent;
  let fixture: ComponentFixture<StudyCaseTreeviewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ StudyCaseTreeviewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StudyCaseTreeviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
