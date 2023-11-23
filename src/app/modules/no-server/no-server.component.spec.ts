import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NoServerComponent } from './no-server.component';

describe('NoServerComponent', () => {
  let component: NoServerComponent;
  let fixture: ComponentFixture<NoServerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ NoServerComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(NoServerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
