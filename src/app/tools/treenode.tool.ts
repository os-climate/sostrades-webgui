import { TreeNode } from '../models/tree-node.model';
import { PostOntology } from '../models/ontology.model';

export class TreenodeTools {

  constructor() { }

  public static recursiveTreenodeExtract(treenode: TreeNode, ontologyRequest: PostOntology) {

    if (treenode !== undefined && treenode !== null) {

      if (treenode.modelsFullPathList !== undefined && treenode.modelsFullPathList !== null) {
        treenode.modelsFullPathList.forEach(modelFullPath => {
          if (ontologyRequest.ontology_request.disciplines.indexOf(modelFullPath) < 0) {
            ontologyRequest.ontology_request.disciplines.push(modelFullPath);
          }
        });
      }

      if (Object.keys(treenode.data).length > 0) {
        Object.keys(treenode.data).forEach(d => {
          
          if (ontologyRequest.ontology_request.parameter_usages.indexOf(treenode.data[d].variableKey) < 0) {
            ontologyRequest.ontology_request.parameter_usages.push(treenode.data[d].variableKey);
          }
        });
      }

      if (Object.keys(treenode.dataDisc).length > 0) {
        Object.keys(treenode.dataDisc).forEach(d => {
          
          if (ontologyRequest.ontology_request.parameter_usages.indexOf(treenode.dataDisc[d].variableKey) < 0) {
            ontologyRequest.ontology_request.parameter_usages.push(treenode.dataDisc[d].variableKey);
          }
          
        });
      }
      if (treenode.children.value.length > 0) {
        treenode.children.value.forEach(tn => {
          this.recursiveTreenodeExtract(tn, ontologyRequest);
        });
      }
    }
  }
}
