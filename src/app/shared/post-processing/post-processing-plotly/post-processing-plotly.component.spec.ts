import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PostProcessingPlotlyComponent } from './post-processing-plotly.component';

describe('PostProcessingPlotlyComponent', () => {
  let component: PostProcessingPlotlyComponent;
  let fixture: ComponentFixture<PostProcessingPlotlyComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PostProcessingPlotlyComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PostProcessingPlotlyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
