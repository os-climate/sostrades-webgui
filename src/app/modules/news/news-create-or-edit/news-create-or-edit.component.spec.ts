import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NewsCreateOrEditComponent } from './news-create-or-edit.component';

describe('NewsCreateOrEditComponent', () => {
  let component: NewsCreateOrEditComponent;
  let fixture: ComponentFixture<NewsCreateOrEditComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ NewsCreateOrEditComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(NewsCreateOrEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
