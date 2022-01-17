import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PostProcessingParetoFrontComponent } from './post-processing-pareto-front.component';

describe('PostProcessingParetoFrontComponent', () => {
  let component: PostProcessingParetoFrontComponent;
  let fixture: ComponentFixture<PostProcessingParetoFrontComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PostProcessingParetoFrontComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PostProcessingParetoFrontComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
