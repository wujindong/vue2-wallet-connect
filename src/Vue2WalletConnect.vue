<template>
  <div>
    <van-button type="primary" @click="connect">Create Connect</van-button>
  </div>
</template>

<script>
import WalletConnect from "@walletconnect/client";
import QRCodeModal from "@walletconnect/qrcode-modal";
import { convertUtf8ToHex } from "@walletconnect/utils";
export default {
  components: {},
  name: "Vue2WalletConnect",
  data() {
    return {
      connector: null,
      connected: false,
      chainId: 1,
      accounts: [],
      address: "",
      fetching: false,
      assets: [],
      showModal: false,
      pendingRequest: false,
      result: null,
    };
  },
  methods: {
    restSate() {
      this.connector = null;
      this.fetching = false;
      this.connected = false;
      this.chainId = 1;
      this.showModal = false;
      this.pendingRequest = false;
      this.uri = "";
      this.accounts = [];
      this.address = "";
      this.result = null;
      this.assets = [];
    },
    async connect() {
      // bridge url
      const bridge = "https://bridge.walletconnect.org";

      // create new connector

      console.log("QRCodeModal", QRCodeModal);

      const connector = new WalletConnect({ bridge, qrcodeModal: QRCodeModal });
      console.log(connector);

      this.connector = connector;

      // check if already connected
      if (!connector.connected) {
        // create new session
        await connector.createSession();
      }

      // subscribe to events
      await this.subscribeToEvents();
    },

    subscribeToEvents() {
      const connector = this.connector;

      if (!connector) {
        return;
      }

      connector.on("session_update", async (error, payload) => {
        console.log(`connector.on("session_update")`);

        if (error) {
          throw error;
        }

        const { chainId, accounts } = payload.params[0];
        this.onSessionUpdate(accounts, chainId);
      });

      connector.on("connect", (error, payload) => {
        console.log(`connector.on("connect")`);

        if (error) {
          throw error;
        }

        this.onConnect(payload);
      });

      connector.on("disconnect", (error, payload) => {
        console.log(`connector.on("disconnect")`);

        if (error) {
          throw error;
        }

        this.onDisconnect();
      });

      if (connector.connected) {
        const { chainId, accounts } = connector;
        const address = accounts[0];
        this.connected = true;
        this.chainId = chainId;
        this.accounts = accounts;
        this.address = address;
        this.onSessionUpdate(accounts, chainId);
      }

      this.connector = connector;
    },

    async killSession() {
      const { connector } = this.state;
      if (connector) {
        connector.killSession();
      }
      this.resetApp();
    },
    async resetApp() {
      this.restSate();
    },

    async onConnect(payload) {
      const { chainId, accounts } = payload.params[0];
      const address = accounts[0];
      this.connected = true;
      this.chainId = chainId;
      this.accounts = accounts;
      this.address = address;
      this.getAccountAssets();
    },

    async onDisconnect() {
      this.resetApp();
    },

    async onSessionUpdate(accounts, chainId) {
      const address = accounts[0];
      await this.setState({ chainId, accounts, address });
      await this.getAccountAssets();
    },

    async getAccountAssets() {
      const address = this.address;
      const chainId = this.chainId;
      this.fetching = true;

      try {
        // get account balances
        const assets = await apiGetAccountAssets(address, chainId);
        this.fetching = false;
        this.address = address;
        this.assets = assets;
      } catch (error) {
        console.error(error);
        this.fetching = false;
      }
    },

    toggleModal() {
      this.showModal = !this.showModal;
    },

    async testSendTransaction() {
      const connector = this.connector;
      const address = this.address;
      const chainId = this.chainId;

      if (!connector) {
        return;
      }

      // from
      const from = address;

      // to
      const to = address;

      // nonce
      const _nonce = await apiGetAccountNonce(address, chainId);
      const nonce = sanitizeHex(convertStringToHex(_nonce));

      // gasPrice
      const gasPrices = await apiGetGasPrices();
      const _gasPrice = gasPrices.slow.price;
      const gasPrice = sanitizeHex(
        convertStringToHex(convertAmountToRawNumber(_gasPrice, 9))
      );

      // gasLimit
      const _gasLimit = 21000;
      const gasLimit = sanitizeHex(convertStringToHex(_gasLimit));

      // value
      const _value = 0;
      const value = sanitizeHex(convertStringToHex(_value));

      // data
      const data = "0x";

      // test transaction
      const tx = {
        from,
        to,
        nonce,
        gasPrice,
        gasLimit,
        value,
        data,
      };

      try {
        // open modal
        this.toggleModal();

        // toggle pending request indicator
        this.pendingRequest = true;

        // send transaction
        const result = await connector.sendTransaction(tx);

        // format displayed result
        const formattedResult = {
          method: "eth_sendTransaction",
          txHash: result,
          from: address,
          to: address,
          value: `${_value} ETH`,
        };

        // display result
        this.connector = connector;
        this.pendingRequest = false;
        this.$refs = formattedResult || null;
      } catch (error) {
        console.error(error);
        this.connector = connector;
        this.pendingRequest = false;
        this.result = null;
      }
    },

    async testSignTransaction() {
      const connector = this.connector;
      const address = this.address;
      const chainId = this.chainId;

      if (!connector) {
        return;
      }

      // from
      const from = address;

      // to
      const to = address;

      // nonce
      const _nonce = await apiGetAccountNonce(address, chainId);
      const nonce = sanitizeHex(convertStringToHex(_nonce));

      // gasPrice
      const gasPrices = await apiGetGasPrices();
      const _gasPrice = gasPrices.slow.price;
      const gasPrice = sanitizeHex(
        convertStringToHex(convertAmountToRawNumber(_gasPrice, 9))
      );

      // gasLimit
      const _gasLimit = 21000;
      const gasLimit = sanitizeHex(convertStringToHex(_gasLimit));

      // value
      const _value = 0;
      const value = sanitizeHex(convertStringToHex(_value));

      // data
      const data = "0x";

      // test transaction
      const tx = {
        from,
        to,
        nonce,
        gasPrice,
        gasLimit,
        value,
        data,
      };

      try {
        // open modal
        this.toggleModal();

        // toggle pending request indicator
        this.pendingRequest = true;
        // this.setState({ pendingRequest: true });

        // send transaction
        const result = await connector.signTransaction(tx);

        // format displayed result
        const formattedResult = {
          method: "eth_signTransaction",
          from: address,
          to: address,
          value: `${_value} ETH`,
          result,
        };
        this.connector = connector;
        this.pendingRequest = false;
        this.result = formattedResult || null;
      } catch (error) {
        console.error(error);
        this.connector = connector;
        this.pendingRequest = false;
        this.result = null;
        // this.setState({ connector, pendingRequest: false, result: null });
      }
    },

    async testLegacySignMessage() {
      const connector = this.connector;
      const address = this.address;
      const chainId = this.chainId;

      if (!connector) {
        return;
      }

      // test message
      const message = `My email is john@doe.com - ${new Date().toUTCString()}`;

      // hash message
      const hash = hashMessage(message);

      // eth_sign params
      const msgParams = [address, hash];

      try {
        // open modal
        this.toggleModal();

        // toggle pending request indicator
        this.setState({ pendingRequest: true });

        // send message
        const result = await connector.signMessage(msgParams);

        // verify signature
        const valid = await verifySignature(address, result, hash, chainId);

        // format displayed result
        const formattedResult = {
          method: "eth_sign (legacy)",
          address,
          valid,
          result,
        };

        // display result
        this.connector = connector;
        this.pendingRequest = false;
        this.result = formattedResult || null;
        // this.setState({
        //   connector,
        //   pendingRequest: false,
        //   result: formattedResult || null,
        // });
      } catch (error) {
        console.error(error);
        this.connector = connector;
        this.pendingRequest = false;
        this.result = null;
        // this.setState({ connector, pendingRequest: false, result: null });
      }
    },

    async testStandardSignMessage() {
      const connector = this.connector;
      const address = this.address;
      const chainId = this.chainId;

      if (!connector) {
        return;
      }

      // test message
      const message = `My email is john@doe.com - ${new Date().toUTCString()}`;

      // encode message (hex)
      const hexMsg = convertUtf8ToHex(message);

      // eth_sign params
      const msgParams = [address, hexMsg];

      try {
        // open modal
        this.toggleModal();

        // toggle pending request indicator
        this.setState({ pendingRequest: true });

        // send message
        const result = await connector.signMessage(msgParams);

        // verify signature
        const hash = hashMessage(message);
        const valid = await verifySignature(address, result, hash, chainId);

        // format displayed result
        const formattedResult = {
          method: "eth_sign (standard)",
          address,
          valid,
          result,
        };

        // display result
        this.connector = connector;
        this.pendingRequest = false;
        this.result = formattedResult || null;
      } catch (error) {
        console.error(error);
        this.connector = connector;
        this.pendingRequest = false;
        this.result = null;
      }
    },

    async testPersonalSignMessage() {
      const { connector, address, chainId } = this.state;

      if (!connector) {
        return;
      }

      // test message
      const message = `My email is john@doe.com - ${new Date().toUTCString()}`;

      // encode message (hex)
      const hexMsg = convertUtf8ToHex(message);

      // eth_sign params
      const msgParams = [hexMsg, address];

      try {
        // open modal
        this.toggleModal();

        // toggle pending request indicator
        this.setState({ pendingRequest: true });

        // send message
        const result = await connector.signPersonalMessage(msgParams);

        // verify signature
        const hash = hashMessage(message);
        const valid = await verifySignature(address, result, hash, chainId);

        // format displayed result
        const formattedResult = {
          method: "personal_sign",
          address,
          valid,
          result,
        };

        // display result
        this.setState({
          connector,
          pendingRequest: false,
          result: formattedResult || null,
        });
      } catch (error) {
        console.error(error);
        this.setState({ connector, pendingRequest: false, result: null });
      }
    },

    async testSignTypedData() {
      const connector = this.connector;
      const address = this.address;
      const chainId = this.chainId;

      if (!connector) {
        return;
      }

      const message = JSON.stringify(eip712.example);

      // eth_signTypedData params
      const msgParams = [address, message];

      try {
        // open modal
        this.toggleModal();

        // toggle pending request indicator
        this.setState({ pendingRequest: true });

        // sign typed data
        const result = await connector.signTypedData(msgParams);

        // verify signature
        const hash = hashTypedDataMessage(message);
        const valid = await verifySignature(address, result, hash, chainId);

        // format displayed result
        const formattedResult = {
          method: "eth_signTypedData",
          address,
          valid,
          result,
        };

        // display result
        this.connector = connector;
        this.pendingRequest = false;
        this.result = formattedResult || null;
      } catch (error) {
        console.error(error);
        this.connector = connector;
        this.pendingRequest = false;
        this.result = null;
      }
    },
  },
};
</script>

<style>
</style>