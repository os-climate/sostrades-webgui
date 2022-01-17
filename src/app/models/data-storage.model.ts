

export class DataStorage implements Storage {

  private innerDictionary: { [id: string]: string; };

  constructor() {
    this.clear();
  }

  get length(): number {
    return Object.keys(this.innerDictionary).length;
  }

  clear(): void {
    this.innerDictionary = {};
  }

  getItem(key: string): string {
    if (this.hasKey(key) === true) {
      return this.innerDictionary[key];
    } else {
      return null;
    }
  }

  key(index: number): string {
    if ((index >= 0) && (index < this.length)) {
      return Object.keys(this.innerDictionary)[index];
    } else {
      return null;
    }
  }

  removeItem(key: string): void {
    if (this.hasKey(key) === true) {
      delete this.innerDictionary[key];
    }
  }

  setItem(key: string, value: string): void {
    // let the native variable throw an exception if not exist
    this.innerDictionary[key] = value;
  }

  hasKey(key: string): boolean {
    return this.innerDictionary.hasOwnProperty(key);
  }


}
