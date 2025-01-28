/*
Scientific notation converter adapted from http://mobiusklein.github.io/ng-scientific-notation/

Decimal places to include 5
Minimum mantissa size to format on 5
Some examples
------------------------------
1232 → 1.23200e+3
------------------------------
0.03232 → 3.23200e-2
------------------------------
0,230232000129893 → 2.30232e-1
------------------------------
1232323344,32 → 1.23232e+9
------------------------------
1975840 → 1.97584e+6
------------------------------
*/

import { Pipe, PipeTransform } from '@angular/core';
import { TypeCheckingTools } from 'src/app/tools/type-checking.tool';

@Pipe({
  name: 'scientificNotation'
})
export class ScientificNotationPipe implements PipeTransform {

  transform(value: any, ...args: number[]): unknown {

    let decimals = 5;
    let fractionSize = 7;

    // Make sure input can be parsed as a float
    const regexp = new RegExp(TypeCheckingTools.FLOAT_SCIENTIFIC_REGEX);
    const check = regexp.test(value);

    if (check === false) {
      return value;
    }

    const innerValue = parseFloat(value);

    if (isNaN(innerValue)) {
      return value;
    }

    //#region Input argument management
    if (args.length >= 1) {
      decimals = args[0];
    }

    if (args.length === 2) {
      fractionSize = args[1] + 2;
    }
    //#endregion

    // Parsing input values
    const stringForm = innerValue.toString();

    if ((innerValue < (Math.pow(10, decimals))) && (stringForm.indexOf('.') !== -1)) {
      const splittedValue = stringForm.split(".");
      const mantissa = splittedValue[1];

      if ((mantissa.length > decimals) || (stringForm.length > (decimals * 2))) {
        const scientificNotation = innerValue.toExponential();
        const splittedScientificNotation = scientificNotation.split(/e/);
        let fractional = splittedScientificNotation[0];
        const exponent = splittedScientificNotation[1];

        if (fractional.length > fractionSize) {
          fractional = fractional.slice(0, fractionSize);
        }
        return fractional + "e" + exponent;
      } else {
        return innerValue;
      }
    } else if (innerValue > Math.pow(10, decimals)) {
      const scientificNotation = innerValue.toExponential();
      const splittedScientificNotation = scientificNotation.split(/e/);
      let fractional = splittedScientificNotation[0];
      const exponent = splittedScientificNotation[1];

      if (fractional.length > fractionSize) {
        fractional = fractional.slice(0, fractionSize);
      }
      return fractional + "e" + exponent;
    } else {
      return innerValue;
    }
  }
}
