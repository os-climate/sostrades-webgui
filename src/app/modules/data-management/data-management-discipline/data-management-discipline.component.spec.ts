import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DataManagementDisciplineComponent } from './data-management-discipline.component';

describe('DataManagementDisciplineComponent', () => {
  let component: DataManagementDisciplineComponent;
  let fixture: ComponentFixture<DataManagementDisciplineComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DataManagementDisciplineComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DataManagementDisciplineComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
