import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ModelsStatusTableComponent } from './models-status-table.component';

describe('ModelsStatusTableComponent', () => {
  let component: ModelsStatusTableComponent;
  let fixture: ComponentFixture<ModelsStatusTableComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ModelsStatusTableComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ModelsStatusTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
