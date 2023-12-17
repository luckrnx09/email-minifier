/**
 * Generates a sequence of alphabetical characters.
 */
export class Sequence {
  private current: string[];

  constructor() {
    this.current = ['a'];
  }

  next() {
    const sequence = this.current.join('');
    let i = this.current.length - 1;

    while (i >= 0) {
      if (this.current[i] !== 'z') {
        this.current[i] = this.getNextChar(this.current[i]);
        break;
      } else {
        this.current[i] = 'a';
        i--;
      }
    }

    if (i < 0) {
      this.current.unshift('a');
    }

    return sequence;
  }

  private getNextChar(char: string): string {
    const charCode = char.charCodeAt(0);
    const nextCharCode = charCode + 1;
    return String.fromCharCode(nextCharCode);
  }
}
