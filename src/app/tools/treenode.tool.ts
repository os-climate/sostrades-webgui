import { TreeNode } from '../models/tree-node.model';
import { PostOntology } from '../models/ontology.model';

export class TreenodeTools {

  public static recursiveTreenodeExtract(treenode: TreeNode, ontologyRequest: PostOntology) {

    if (treenode !== undefined && treenode !== null) {

      if (treenode.modelsFullPathList !== undefined && treenode.modelsFullPathList !== null) {
        treenode.modelsFullPathList.forEach(modelFullPath => {
          if (ontologyRequest.ontology_request.disciplines.indexOf(modelFullPath) < 0) {
            ontologyRequest.ontology_request.disciplines.push(modelFullPath);
          }
        });
      }

      if (Object.keys(treenode.dataManagementDisciplineDict).length > 0) {
        Object.values(treenode.dataManagementDisciplineDict).forEach(discipline => {
          Object.keys(discipline.allDataDict).forEach(d => {
            
            if (ontologyRequest.ontology_request.parameter_usages.indexOf(discipline.allDataDict[d].variableKey) < 0) {
              ontologyRequest.ontology_request.parameter_usages.push(discipline.allDataDict[d].variableKey);
            }
          });
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
