import { Pipe, PipeTransform } from '@angular/core';
import { TreeNode } from 'src/app/models/tree-node.model';
import { LoggerService } from 'src/app/services/logger/logger.service';
import { OntologyService } from 'src/app/services/ontology/ontology.service';

@Pipe({
  name: 'disciplineIconMappingConverter'
})
export class DisciplineIconMappingConverterPipe implements PipeTransform {

  private static DATA_ICON = 'fa-solid fa-folder fa-fw';
  private static ROOT_ICON = 'fa-solid fa-sitemap fa-fw';
  private static DEFAULT_ICON = 'fa-fw fa-question-circle fas'

  private static DATA_NAME = 'data';
  private static ROOT_NAME = 'root';

  constructor(private ontologyService: OntologyService,
              private loggerService: LoggerService) { }


  transform(treenode: TreeNode ): string {

    // Initialize with default icon
    let result = DisciplineIconMappingConverterPipe.DEFAULT_ICON;

    let disciplineIdentifier =  treenode.modelNameFullPath;

    if ((disciplineIdentifier === undefined) || (disciplineIdentifier === null)) {
      disciplineIdentifier = treenode.nodeType;
    }

    if (disciplineIdentifier === DisciplineIconMappingConverterPipe.DATA_NAME) {
      result = DisciplineIconMappingConverterPipe.DATA_ICON;
    } else if (disciplineIdentifier === DisciplineIconMappingConverterPipe.ROOT_NAME) {
      result = DisciplineIconMappingConverterPipe.ROOT_ICON;
    } else {
      const ontology = this.ontologyService.getDiscipline(disciplineIdentifier);

      if (ontology !== null && ontology.icon !== null && ontology.icon !== undefined && ontology.icon.length > 0) {
        result = ontology.icon;
      } else {
        this.loggerService.log(`No discipline icon found in ontology for '${disciplineIdentifier}' discipline`);
      }
    }

    return result;
  }

}
