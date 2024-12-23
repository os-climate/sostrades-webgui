import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { StudyCaseDataService } from 'src/app/services/study-case/data/study-case-data.service';
import { Subscription } from 'rxjs';
import { MatTableDataSource } from '@angular/material/table';
import { FilterService } from 'src/app/services/filter/filter.service';
import { NodeData } from 'src/app/models/node-data.model';


@Component({
  selector: 'app-search-panel',
  templateUrl: './search-panel.component.html',
  styleUrls: ['./search-panel.component.scss']
})
export class SearchPanelComponent implements OnInit, OnDestroy {

  @ViewChild('table', { static: false }) table: any;

  private studyCaseSubscription: Subscription;
  private variableList: NodeData[];
  public searchedValue: string;
  public isDataEmpty: boolean;

  public dataSourceRef = new MatTableDataSource<NodeData>();
  displayedColumns = ['label', 'identifier', 'namespace', 'ioType', 'find'];

  constructor(
    private studyCaseDataService: StudyCaseDataService,
    public filterService: FilterService) {

    this.studyCaseSubscription = null;
    this.dataSourceRef = null;
    this.searchedValue='---';
    this.isDataEmpty = true;
  }

  ngOnInit(): void {

    this.studyCaseSubscription = this.studyCaseDataService.onSearchVariableChange.subscribe(searchedValue => {

      if (searchedValue !== null && searchedValue !== undefined && searchedValue.length > 1) {
        this.setDataToView(searchedValue, this.studyCaseDataService.dataSearchResults);
      } else {
        this.dataSourceRef = null;
      }
    });

    
    if (this.studyCaseDataService.dataSearchInput !== null && 
      this.studyCaseDataService.dataSearchInput !== undefined && 
      this.studyCaseDataService.dataSearchInput.length > 1) {
        this.setDataToView(this.studyCaseDataService.dataSearchInput, this.studyCaseDataService.dataSearchResults);
    }

  }

  ngOnDestroy(): void {
    if (this.studyCaseSubscription !== null && this.studyCaseSubscription !== undefined) {
      this.studyCaseSubscription.unsubscribe();
      this.studyCaseSubscription = null;
    }

  }
  


  private setDataToView(searchedValue: string, datas: NodeData[]) {

    this.searchedValue = searchedValue;
    this.variableList = datas;
    this.isDataEmpty = datas.length === 0;
    this.dataSourceRef = new MatTableDataSource<NodeData>(this.variableList);


  }

  goToVariable(nodeData: NodeData) {
    this.studyCaseDataService.onShowDataManagementContent.emit(true);
    this.studyCaseDataService.onTreeNodeNavigation.emit(this.studyCaseDataService.loadedStudy.treeview.rootNodeDataDict[nodeData.identifier]);
  }
}
