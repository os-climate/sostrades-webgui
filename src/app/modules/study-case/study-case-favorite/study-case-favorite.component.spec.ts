import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StudyCaseFavoriteComponent } from './study-case-favorite.component';

describe('StudyCaseFavoriteComponent', () => {
  let component: StudyCaseFavoriteComponent;
  let fixture: ComponentFixture<StudyCaseFavoriteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ StudyCaseFavoriteComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(StudyCaseFavoriteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
