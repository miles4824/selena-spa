// =============================================================
// CLOUD: FIREBASE REALTIME ENGINE BRIDGING
// =============================================================
const CloudFirebase = {
  sync(path, data) {
    if (typeof firebasePut === 'function') return firebasePut(path, data);
  }
};
