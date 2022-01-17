import { Injectable } from '@angular/core';
import { TreeNode } from 'src/app/models/tree-node.model';

@Injectable({
  providedIn: 'root'
})
export class DragDropService {

  draggedElement: TreeNode;

  constructor() {
    this.draggedElement = null;
  }
}
