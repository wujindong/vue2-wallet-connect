import Vue2WalletConnect from "./src/Vue2WalletConnect.vue";

Vue2WalletConnect.install = (Vue) => {
  Vue.component(Vue2WalletConnect.name, Vue2WalletConnect);
};

export default Vue2WalletConnect;
