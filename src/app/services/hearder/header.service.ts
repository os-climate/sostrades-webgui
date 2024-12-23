import { EventEmitter, Injectable, Output } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class HeaderService {
  @Output() changeIndexTabEvent = new EventEmitter<number>();
  @Output() changeTitleEvent = new EventEmitter<string>();
  
  changeIndexTab( index :number){
    this.changeIndexTabEvent.emit(index)
  }

  changeTitle(title : string){
    this.changeTitleEvent.emit(title)
  }

}

