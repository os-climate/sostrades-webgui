import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PostProcessingBundleComponent } from './post-processing-bundle.component';

describe('PostProcessingBundleComponent', () => {
  let component: PostProcessingBundleComponent;
  let fixture: ComponentFixture<PostProcessingBundleComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PostProcessingBundleComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PostProcessingBundleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
