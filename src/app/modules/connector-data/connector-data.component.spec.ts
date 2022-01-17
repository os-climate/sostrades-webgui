import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConnectorDataComponent } from './connector-data.component';

describe('ConnectorDataComponent', () => {
  let component: ConnectorDataComponent;
  let fixture: ComponentFixture<ConnectorDataComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ConnectorDataComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ConnectorDataComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
