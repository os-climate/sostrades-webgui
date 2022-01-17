import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PostProcessingComponent } from './post-processing.component';

describe('PostProcessingComponent', () => {
  let component: PostProcessingComponent;
  let fixture: ComponentFixture<PostProcessingComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PostProcessingComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PostProcessingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
