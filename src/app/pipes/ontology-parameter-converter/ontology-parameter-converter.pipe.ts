import { Pipe, PipeTransform } from '@angular/core';
import { LoggerService } from 'src/app/services/logger/logger.service';
import { OntologyService } from 'src/app/services/ontology/ontology.service';

@Pipe({
  name: 'ontologyParameterConverter'
})
export class OntologyParameterConverterPipe implements PipeTransform {

  /**
   *
   */
  constructor(private ontologyService: OntologyService,
              private loggerService: LoggerService) { }


    transform(parameter: string): string {
      let result = parameter;

      const ontology = this.ontologyService.getParameter(parameter);

      if (ontology !== null && ontology.label !== null && ontology.label !== undefined && ontology.label.length > 0) {

        result = ontology.label;

        if (ontology.unit !== null && ontology.unit !== undefined && ontology.unit.length > 0) {
          result = `${result} [${ontology.unit}]`;
        } else {
          result = `${result} [-]`;
        }
      } else {
        this.loggerService.log(`No ontology conversion found for ${parameter} parameter`);
      }

      return result;
    }

}
