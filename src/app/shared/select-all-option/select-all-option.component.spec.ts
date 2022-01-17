import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SelectAllOptionComponent } from './select-all-option.component';

describe('SelectAllOptionComponent', () => {
  let component: SelectAllOptionComponent;
  let fixture: ComponentFixture<SelectAllOptionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SelectAllOptionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SelectAllOptionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
