import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DataManagementContainerComponent } from './data-management-container.component';

describe('DataManagementContainerComponent', () => {
  let component: DataManagementContainerComponent;
  let fixture: ComponentFixture<DataManagementContainerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DataManagementContainerComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DataManagementContainerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
