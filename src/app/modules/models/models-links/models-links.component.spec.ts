import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ModelsLinksComponent } from './models-links.component';

describe('ModelsLinksComponent', () => {
  let component: ModelsLinksComponent;
  let fixture: ComponentFixture<ModelsLinksComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ModelsLinksComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ModelsLinksComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
