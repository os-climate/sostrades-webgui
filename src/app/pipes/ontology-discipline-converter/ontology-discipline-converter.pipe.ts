import { Pipe, PipeTransform } from '@angular/core';
import { LoggerService } from 'src/app/services/logger/logger.service';
import { OntologyService } from 'src/app/services/ontology/ontology.service';

@Pipe({
  name: 'ontologyDisciplineConverter'
})
export class OntologyDisciplineConverterPipe implements PipeTransform {

  constructor(private ontologyService: OntologyService,
              private loggerService: LoggerService) { }


  transform(discipline: string | string[]): string {

    const values: string[] = [];

    if (typeof discipline === 'string') {
      values.push(discipline);
    } else {
      discipline.forEach(str => {
        values.push(str);
      });
    }

    const result: string[] = [];

    values.forEach(disciplineId => {
      const ontology = this.ontologyService.getDiscipline(disciplineId);

      if (ontology !== null && ontology.label !== null && ontology.label !== undefined && ontology.label.length > 0) {
        result.push(ontology.label);
      } else {
        result.push(disciplineId);
        this.loggerService.log(`No ontology conversion found for '${discipline}' discipline`);
      }
    });

    return result.join('\n');
  }

}
