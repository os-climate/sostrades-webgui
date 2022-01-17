import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DataManagementInformationComponent } from './data-management-information.component';

describe('ConfigureInformationComponent', () => {
  let component: DataManagementInformationComponent;
  let fixture: ComponentFixture<DataManagementInformationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DataManagementInformationComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DataManagementInformationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
