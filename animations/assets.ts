class AssetManager {
  dictionary: Record<string, any>;

  constructor() {
    this.dictionary = {};
  }

  set(key: string, value: string) {
    this.dictionary[key] = value;
  }

  get(key: string) {
    return this.dictionary[key];
  }
}

export {AssetManager};