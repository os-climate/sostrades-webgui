export class TypeCheckingTools {

  static readonly FLOAT_SCIENTIFIC_REGEX = '^[-+]?[0-9]*\.?[0-9]+([eE][-+]?[0-9]+)?$';
  static readonly INTEGER_REGEX = '^[0-9]+$';
  static readonly EMAIL_REGEX = '^[^\\s@]+@[^\\s@]+\\.[^\\s@]{2,}$';
  static readonly TEXT_LETTER_NUMBER_REGEX = '^[A-Za-z0-9_-]*$';

  constructor() { }

  public static isFloat(val: string): boolean {
    const floatRegex = /^[+\-]?(?=.)(?:0|[1-9]\d*)?(?:\.\d*)?(?:\d[eE][+\-]?\d+)?$/;
    if (!floatRegex.test(val)) {
      return false;
    }

    const testVal = parseFloat(val);
    if (isNaN(testVal)) {
      return false;
    }
    return true;
  }

  public static isInt(val: string): boolean {
    const intRegex = /^-?\d+$/;
    if (!intRegex.test(val)) {
      return false;
    }

    const intVal = parseInt(val, 10);
    return parseFloat(val) === intVal && !isNaN(intVal);
  }
}
