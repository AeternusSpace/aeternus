/* Ethereum Imports */
import { ethers } from 'ethers';
import Web3Modal from 'web3modal';
import WalletConnectProvider from '@walletconnect/web3-provider';
import Torus from '@toruslabs/torus-embed';
/* Tezos Imports */
import { BeaconWallet } from '@taquito/beacon-wallet';
import { TezosToolkit } from '@taquito/taquito';
import { NetworkType, BeaconEvent } from '@airgap/beacon-sdk';
import { TaquitoTezosDomainsClient } from '@tezos-domains/taquito-client';
import { Tzip16Module } from '@taquito/tzip16';
/* Local Imports */
import { parseIPFS } from './utils/helpers';

const WALLET_STATE = {
  DISCONNECTED: 0,
  CONNECTING: 1,
  CONNECTED: 2,
  DISCONNECTING: 3,
};

WL.registerComponent('wallet', {
    
}, {
  init: function() {
    this.ethereumStatus = WALLET_STATE.DISCONNECTED;
    this.tezosStatus = WALLET_STATE.DISCONNECTED;
    
    // Grab HTML elements
    const walletButton = document.getElementById('wallet-button');
    const walletModal = document.getElementById('wallet-modal');
    const closeModal = document.getElementById('close-modal');
    this.ethereumButton = document.getElementById('ethereum-button');
    this.ethereumAddress = document.getElementById('ethereum-address');
    this.tezosButton = document.getElementById('tezos-button');
    this.tezosAddress = document.getElementById('tezos-address');

    // Ethereum objects
    this.web3Modal;
    this.ethProvider;

    // Tezos objects
    this.tezosWallet = null;

    // Setup event listeners
    walletButton.onclick = () => {
      if (walletModal.style.visibility === 'hidden') {
        walletModal.style.visibility = 'initial'
        walletModal.classList.add('modal-fadein');
      }
      else {
        walletModal.style.visibility = 'hidden';
        walletModal.classList.remove('modal-fadein');
      }
    }
    closeModal.onclick = () => {
      walletModal.style.visibility = 'hidden';
      walletModal.classList.remove('modal-fadein');
    }
    this.ethereumButton.onclick = () => {
      switch (this.ethereumStatus) {
        case WALLET_STATE.DISCONNECTED:
          this.connectEthereumWallet();
          break;
        case WALLET_STATE.DISCONNECTING:
          console.log("Error: Currently disconnecting existing Ethereum wallet.");
          break;
        case WALLET_STATE.CONNECTED:
          this.disconnectEthereumWallet();
          break;
        case WALLET_STATE.CONNECTING:
          console.log("Error: Currently connecting an Ethereum wallet.");
          break;
      }
    }
    this.tezosButton.onclick = () => {
      switch (this.tezosStatus) {
        case WALLET_STATE.DISCONNECTED:
          this.connectTezosWallet();
          break;
        case WALLET_STATE.DISCONNECTING:
          console.log("Error: Currently disconnecting existing Tezos wallet.");
          break;
        case WALLET_STATE.CONNECTED:
          this.disconnectTezosWallet();
          break;
        case WALLET_STATE.CONNECTING:
          console.log("Error: Currently connecting a Tezos wallet.");
          break;
      }
    }
  },
  start: function() {
    // Blank
  },
  update: function(dt) {
    // Blank
  },
  connectEthereumWallet: async function() {
    this.ethereumAddress.innerText = "Connecting...";
    this.ethereumStatus = WALLET_STATE.CONNECTING;

    const providerOptions = {
      walletconnect: {
        package: WalletConnectProvider,
        options: {
          infuraId: '040a3045d3e9426f83d7cb94569dba31'
        }
      },
      torus: {
        package: Torus        
      }
    };

    this.web3Modal = new Web3Modal({
      network: 'mainnet',
      cacheProvider: true,
      providerOptions,
      theme: "dark"
    });

    try {
      this.ethProvider = await this.web3Modal.connect();
    }
    catch(err) {
      console.log(err);
      this.ethereumAddress.innerText = 'Wallet not connected.'
      this.ethereumStatus = WALLET_STATE.DISCONNECTED;
      return;
    }
    
    const ethersProvider = new ethers.providers.Web3Provider(this.ethProvider);
    const signer = ethersProvider.getSigner();

    const walletAddress = (await ethersProvider.listAccounts())[0];
    const wallet = await ethersProvider.lookupAddress(walletAddress) || walletAddress;
    this.ethereumAddress.innerText = wallet;
    
    this.ethereumStatus = WALLET_STATE.CONNECTED;
  },
  disconnectEthereumWallet: async function() {
    this.ethereumAddress.innerText = "Disconnecting wallet...";
    this.ethereumStatus = WALLET_STATE.DISCONNECTING;

    await this.web3Modal.clearCachedProvider();
    
    this.ethereumAddress.innerText = 'No wallet connected.';
    this.ethereumStatus = WALLET_STATE.DISCONNECTED;
  },
  getEthereumTokens: async function() {
    /*let balance = await ethersProvider.getBalance(wallet);
    balance = ethers.utils.formatEther(balance);

    console.log(balance);*/
  },
  connectTezosWallet: async function() {
    this.tezosAddress.innerText = "Connecting...";
    // There is currently no good way to detect if the window for this gets closed right now
    // Going to skip this for the time being
    // this.tezosStatus = WALLET_STATE.CONNECTING;

    const rpcUrl = 'https://api.tez.ie/rpc/mainnet';
    const apiBase = 'https://api.better-call.dev/v1/account';
    let currentAddress;
    const Tezos = new TezosToolkit(rpcUrl);
    Tezos.addExtension(new Tzip16Module());
    const client = new TaquitoTezosDomainsClient({ tezos: Tezos, network: 'mainnet', caching: { enabled: true } });
    if (!this.tezosWallet) {
      this.tezosWallet = new BeaconWallet({
        name: "Aeternus",
        preferredNetwork: NetworkType.MAINNET,
      });
    }
    Tezos.setWalletProvider(this.tezosWallet);
    const activeAccount = await this.tezosWallet.client.getActiveAccount();
    if (activeAccount) {
      currentAddress = activeAccount.address;
    }
    else {
      await this.tezosWallet.requestPermissions({
        network: {
          type: 'mainnet',
        },
      });

      currentAddress = await this.tezosWallet.getPKH();
    }
    const address = (await client.resolver.resolveAddressToName(currentAddress)) ?? currentAddress;
    
    this.tezosAddress.innerText = address;
    this.tezosStatus = WALLET_STATE.CONNECTED;
  },
  disconnectTezosWallet: async function() {
    this.tezosAddress.innerText = "Disconnecting...";
    this.tezosStatus = WALLET_STATE.DISCONNECTING;

    await this.tezosWallet.clearActiveAccount();
    this.tezosWallet = null;

    this.tezosAddress.innerText = "No wallet connected.";
    this.tezosStatus = WALLET_STATE.DISCONNECTED;
  },
  getTezosTokens: async function() {
    /* Update this later
    // This needs to eventually check total amount of tokens and grab anything over 50 using offset parameter
    const allTokens = await (await fetch(`${apiBase}/mainnet/${currentAddress}/token_balances?size=50`)).json();
    console.log(allTokens);
    const tokens = allTokens.balances.filter(token => token.artifact_uri);
    tokens.forEach(token => token.artifact_uri = parseIPFS(token.artifact_uri));
    console.log("Pulling tokens from: " + address);
    console.log(tokens);
    */
  }
});