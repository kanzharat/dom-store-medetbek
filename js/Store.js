// Store of { name, price, qty } items, the class from lab 4 (js-core-medetbek).
// Only two things changed here: no export keyword, so index.html opens straight from
// the file system without a server, and setQty was added for the plus and minus buttons.

class Store {
  #items = []; // private, not visible outside the class

  constructor(items = []) {
    items.forEach((item) => this.add(item));
  }

  // Checks the shape of an item before it goes into the store
  static isValidItem(item) {
    if (item === null || typeof item !== 'object') return false;
    const { name, price, qty } = item;
    return (
      typeof name === 'string' && name.trim() !== '' &&
      Number.isFinite(price) && price >= 0 &&
      Number.isInteger(qty) && qty >= 0
    );
  }

  // Adds a copy of the item, the same name again only raises qty, returns this for chaining
  add(item) {
    if (!Store.isValidItem(item)) throw new TypeError('item must be { name: string, price: number, qty: integer }');
    const { name, price, qty } = item;
    const found = this.find(name);
    if (found) {
      found.qty += qty;
    } else {
      this.#items.push({ name, price, qty });
    }
    return this;
  }

  // Removes the item by name, true if it was there
  remove(name) {
    const before = this.#items.length;
    this.#items = this.#items.filter((item) => item.name !== name);
    return this.#items.length < before;
  }

  // Sets a new qty, false if there is no such item or the qty is not a whole number >= 0
  setQty(name, qty) {
    const found = this.find(name);
    if (!found || !Number.isInteger(qty) || qty < 0) return false;
    found.qty = qty;
    return true;
  }

  // Item with this name or null
  find(name) {
    return this.#items.find((item) => item.name === name) ?? null;
  }

  // Sum of price × qty over all items
  total() {
    return this.#items.reduce((sum, { price, qty }) => sum + price * qty, 0);
  }

  // Copy of the list, push or pop on it does not change the store
  list() {
    return [...this.#items];
  }

  get size() {
    return this.#items.length;
  }
}
