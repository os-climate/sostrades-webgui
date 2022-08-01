export class OntologyGeneralInformation {

    constructor(
      public description: string,
      public entityCount: any,
      public iri: string,
      public lastUpdated: string,
      public version: string,
      public sourceCodeTraceability: any

      ) {
    }

    public static Create(jsonData: any): OntologyGeneralInformation {
      const result: OntologyGeneralInformation = new OntologyGeneralInformation(
        jsonData[OntologyGeneralInformationAttributes.DESCRIPTION],
        jsonData[OntologyGeneralInformationAttributes.ENTITY_COUNT],
        jsonData[OntologyGeneralInformationAttributes.IRI],
        jsonData[OntologyGeneralInformationAttributes.LAST_UPDATED],
        jsonData[OntologyGeneralInformationAttributes.VERSION],
        jsonData[OntologyGeneralInformationAttributes.SOURCE_CODE_TRACEABILITY]
        );
      return result;
    }
}

export enum OntologyGeneralInformationAttributes {
    DESCRIPTION = 'description',
    VERSION = 'version',
    IRI = 'iri',
    LAST_UPDATED = 'last_updated',
    ENTITY_COUNT = 'entity_count',
    SOURCE_CODE_TRACEABILITY = 'source_code_traceability'
  }
