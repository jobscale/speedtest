const log = () => undefined;

export const store = {
  setItem(key, value) {
    store[key] = JSON.stringify(value);
  },

  getItem(key) {
    try {
      return JSON.parse(store[key]);
    } catch (e) {
      log(e.message);
      return undefined;
    }
  },
};
