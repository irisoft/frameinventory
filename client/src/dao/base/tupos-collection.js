class TuposCollection {
  constructor(collection, Model) {
    if (!Array.isArray(collection)) {
      this._items = []
    } else {
      this._items = collection.map(item => new Model(item))
    }
  }

  get items() {
    return this._items || []
  }

  [Symbol.iterator]() {
    let index = -1
    const data = this._items

    return {
      next: () => {
        index += 1
        return { value: data[index], done: !(index in data) }
      },
    }
  }
}

export default TuposCollection
