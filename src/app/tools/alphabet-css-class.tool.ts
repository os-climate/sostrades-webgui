export class AlhpabetCssClassTools {

  public static getCssClassForLetter(letter: string): string {
    let cssClass = '';
    if (letter.length > 0) {
      letter = letter[0].toUpperCase();

      switch (letter) {
        case 'A':
          cssClass = 'amethyst';
          break;
        case 'B':
          cssClass = 'blue';
          break;
        case 'C':
          cssClass = 'caramel';
          break;
        case 'D':
          cssClass = 'damson';
          break;
        case 'E':
          cssClass = 'ebony';
          break;
        case 'F':
          cssClass = 'forest';
          break;
        case 'G':
          cssClass = 'green';
          break;
        case 'H':
          cssClass = 'honey';
          break;
        case 'I':
          cssClass = 'iron';
          break;
        case 'J':
          cssClass = 'jade';
          break;
        case 'K':
          cssClass = 'kingcrab';
          break;
        case 'L':
          cssClass = 'lavender';
          break;
        case 'M':
          cssClass = 'magenta';
          break;
        case 'N':
          cssClass = 'navy';
          break;
        case 'O':
          cssClass = 'orange';
          break;
        case 'P':
          cssClass = 'pink';
          break;
        case 'Q':
          cssClass = 'quagmire';
          break;
        case 'R':
          cssClass = 'red';
          break;
        case 'S':
          cssClass = 'sea';
          break;
        case 'T':
          cssClass = 'turquoise';
          break;
        case 'U':
          cssClass = 'ultraviolet';
          break;
        case 'V':
          cssClass = 'violet';
          break;
        case 'W':
          cssClass = 'wine';
          break;
        case 'X':
          cssClass = 'xanthin';
          break;
        case 'Y':
          cssClass = 'yellow';
          break;
        case 'Z':
          cssClass = 'zinnia';
          break;
      }
      return cssClass;
    }

  }
}
