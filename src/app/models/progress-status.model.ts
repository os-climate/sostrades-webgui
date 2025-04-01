export class ProgressStatus {

  constructor(
    public id: number,
    public progressText: string,
    public progress: number,
    public nextProgress: number,
    public isInError: boolean,
    public errorMessage:string,
    public isFinished:boolean) {
  }

  public static Create(jsonData: any): ProgressStatus {
    const result: ProgressStatus = new ProgressStatus(
      jsonData[PorgressStatusAttributes.ID],
      jsonData[PorgressStatusAttributes.PROGESSTEXT],
      jsonData[PorgressStatusAttributes.PROGRESS],
      jsonData[PorgressStatusAttributes.NEXTPROGRESS],
      jsonData[PorgressStatusAttributes.ISINERROR],
      jsonData[PorgressStatusAttributes.ERRORMESSAGE],
      jsonData[PorgressStatusAttributes.ISFINISHED],
    );
    return result;
  }
}

export enum PorgressStatusAttributes {
  ID = 'id',
  PROGESSTEXT = 'progress_text',
  PROGRESS = 'progress',
  ISINERROR = 'is_in_error',
  ERRORMESSAGE = 'error_message',
  ISFINISHED = 'is_finished',
  NEXTPROGRESS = 'next_progress'
}

