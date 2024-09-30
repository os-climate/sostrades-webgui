
export class Flavor {


  constructor(
    public name: string,
    public CPULimit: string,
    public CPURequest: string,
    public MemoryLimit: string,
    public MemoryRequest: string
    ) {
     
    }


  public static Create(key:string, jsonData: any): Flavor {
    const result = new Flavor(
      key,
      jsonData[FlavorAttributes.LIMITS][FlavorAttributes.CPU],
      jsonData[FlavorAttributes.REQUEST][FlavorAttributes.CPU],
      jsonData[FlavorAttributes.LIMITS][FlavorAttributes.MEMORY],
      jsonData[FlavorAttributes.REQUEST][FlavorAttributes.MEMORY],
    );
    return result;
  }


}


export enum FlavorAttributes {

  LIMITS = 'limits',
  REQUEST = 'requests',
  CPU = 'cpu',
  MEMORY = 'memory'
}

