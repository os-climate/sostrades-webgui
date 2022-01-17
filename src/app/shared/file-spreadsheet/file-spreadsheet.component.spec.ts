import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FileSpreadsheetComponent } from './file-spreadsheet.component';

describe('FileSpreadsheetComponent', () => {
  let component: FileSpreadsheetComponent;
  let fixture: ComponentFixture<FileSpreadsheetComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FileSpreadsheetComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FileSpreadsheetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
