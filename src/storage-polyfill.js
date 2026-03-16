// Polyfill for window.storage (Claude artifact API → localStorage)
if (!window.storage) {
  window.storage = {
    async get(key) {
      const val = localStorage.getItem(key);
      return val !== null ? { value: val } : null;
    },
    async set(key, value) {
      localStorage.setItem(key, value);
    },
  };
}
