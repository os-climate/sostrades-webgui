import { Injectable } from '@angular/core';
import { TreeNode } from '../models/tree-node.model';
import { BehaviorSubject } from 'rxjs';


@Injectable()
export class TreeNodeDataService {

  private treeNodeDataSource: BehaviorSubject<TreeNode> = new BehaviorSubject(null);
  currentTreeNodeData = this.treeNodeDataSource.asObservable();
  public currentTreeNode :TreeNode = null;

  send_tree_node(data: TreeNode) {
    this.treeNodeDataSource.next(data);
    this.currentTreeNode = data;
  }
}
