import { EventEmitter, Injectable, Output } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class HeaderService {
  @Output() onChangeIndexTab = new EventEmitter<number>();
  @Output() onChangeTitle = new EventEmitter<string>()
  
  constructor() { }

  
  changeIndexTab( index :number){
    this.onChangeIndexTab.emit(index)
  }

  changeTitle(title : string){
    this.onChangeTitle.emit(title)
  }

}

