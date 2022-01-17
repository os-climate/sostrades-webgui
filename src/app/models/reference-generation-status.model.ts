export class ReferenceGenerationStatus {

  constructor(
    public refGenId: number,
    public referenceGenerationStatus: string,
    public generationLogs: string,
    public referenceName: string,
    public creationDate: Date,
    public kubernetePodName: string
  ) { }

  public static Create(jsonData: any): ReferenceGenerationStatus {
    const result: ReferenceGenerationStatus = new ReferenceGenerationStatus(
      jsonData[StudyCaseExecutionStatusAttributes.REF_GEN_ID],
      jsonData[StudyCaseExecutionStatusAttributes.REF_GEN_STATUS],
      jsonData[StudyCaseExecutionStatusAttributes.GENERATION_LOGS],
      jsonData[StudyCaseExecutionStatusAttributes.REFERENCENAME],
      jsonData[StudyCaseExecutionStatusAttributes.CREATION_DATE],
      jsonData[StudyCaseExecutionStatusAttributes.KUBERNETEPODNAME]);

    return result;
  }

  public toString = (): string => {
    const strings: string[] = [];
    strings.push(`reference generation identifier : ${this.refGenId}`);
    strings.push(`reference generation status : ${this.referenceGenerationStatus}`);
    return strings.join('\n');
  }
}

export enum StudyCaseExecutionStatusAttributes {
  REF_GEN_ID = 'id',
  REFERENCENAME = 'reference_name',
  REF_GEN_STATUS = 'execution_status',
  GENERATION_LOGS = 'generation_logs',
  CREATION_DATE = 'creation_date',
  KUBERNETEPODNAME = 'kubernete_pod_name'
}


