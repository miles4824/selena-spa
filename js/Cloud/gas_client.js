// =============================================================
// CLOUD: GOOGLE APPS SCRIPT API CLIENT BRIDGING
// =============================================================
const CloudGas = {
  call(action, payload) {
    if (typeof callGasApi === 'function') return callGasApi(action, payload);
  }
};
