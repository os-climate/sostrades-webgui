
export class Flavor {


  constructor(
    public name: string,
    public CPULimit: string,
    public CPURequest: string,
    public CPULimitUnit: string,
    public CPURequestUnit: string,
    public memoryLimit: string,
    public memoryRequest: string,
    public memoryRequestUnit: string,
    public memoryLimitUnit: string,
    ) {
     
    }


  public static Create(key:string, jsonData: any): Flavor {
    const result = new Flavor(
      key,
      jsonData[FlavorAttributes.LIMITS][FlavorAttributes.CPU],
      jsonData[FlavorAttributes.REQUEST][FlavorAttributes.CPU],
      jsonData[FlavorAttributes.LIMITS][FlavorAttributes.CPU_UNIT],
      jsonData[FlavorAttributes.REQUEST][FlavorAttributes.CPU_UNIT],
      jsonData[FlavorAttributes.LIMITS][FlavorAttributes.MEMORY],
      jsonData[FlavorAttributes.REQUEST][FlavorAttributes.MEMORY],
      jsonData[FlavorAttributes.LIMITS][FlavorAttributes.MEMORY_UNIT],
      jsonData[FlavorAttributes.REQUEST][FlavorAttributes.MEMORY_UNIT]
      
    );
    return result;
  }


}


export enum FlavorAttributes {

  LIMITS = 'limits',
  REQUEST = 'requests',
  CPU = 'cpu',
  MEMORY = 'memory',
  MEMORY_UNIT = 'memory_unit',
  CPU_UNIT = 'cpu_unit'
}

