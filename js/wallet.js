/* Ethereum Imports */
import { ethers } from 'ethers';
import Web3Modal from 'web3modal';
import WalletConnectProvider from '@walletconnect/web3-provider';
/* Tezos Imports */
import { BeaconWallet } from '@taquito/beacon-wallet';
import { TezosToolkit } from '@taquito/taquito';
import { NetworkType } from '@airgap/beacon-sdk';
import { TaquitoTezosDomainsClient } from '@tezos-domains/taquito-client';
import { Tzip16Module } from '@taquito/tzip16';
/* Local Imports */
import { parseIPFS } from './utils/helpers';

WL.registerComponent('wallet', {
    
}, {
  init: function() {
    // Blank
  },
  start: function() {
    //this.connectTezosWallet(); 
    //this.connectEthereumWallet();
  },
  update: function(dt) {

  },
  connectEthereumWallet: async function() {
    const providerOptions = {
      walletconnect: {
        package: WalletConnectProvider,
        options: {
          infuraId: '040a3045d3e9426f83d7cb94569dba31'
        }
      }
    };

    const web3Modal = new Web3Modal({
      network: 'mainnet',
      cacheProvider: true,
      providerOptions,
      theme: "dark"
    });

    const provider = await web3Modal.connect();
    
    const ethersProvider = new ethers.providers.Web3Provider(provider);
    const signer = ethersProvider.getSigner();

    const walletAddress = await ethersProvider.listAccounts();
    let balance = await ethersProvider.getBalance(walletAddress[0]);
    balance = ethers.utils.formatEther(balance);

    console.log(balance);
  },
  connectTezosWallet: async function() {
    const rpcUrl = 'https://api.tez.ie/rpc/mainnet';
    const apiBase = 'https://api.better-call.dev/v1/account';
    let currentAddress;
    const Tezos = new TezosToolkit(rpcUrl);
    Tezos.addExtension(new Tzip16Module());
    const client = new TaquitoTezosDomainsClient({ tezos: Tezos, network: 'mainnet', caching: { enabled: true } });
    const wallet = new BeaconWallet({
      name: "Aeternus",
      preferredNetwork: NetworkType.MAINNET,
    });
    const activeAccount = await wallet.client.getActiveAccount();
    if (activeAccount) {
      currentAddress = activeAccount.address;
    }
    else {
      await wallet.requestPermissions({
        network: {
          type: 'mainnet',
        },
      });

      currentAddress = await wallet.getPKH();
    }
    Tezos.setWalletProvider(wallet);
    const address = (await client.resolver.resolveAddressToName(currentAddress)) ?? currentAddress;
    // This needs to eventually check total amount of tokens and grab anything over 50 using offset parameter
    const allTokens = await (await fetch(`${apiBase}/mainnet/${currentAddress}/token_balances?size=50`)).json();
    console.log(allTokens);
    const tokens = allTokens.balances.filter(token => token.artifact_uri);
    tokens.forEach(token => token.artifact_uri = parseIPFS(token.artifact_uri));
    console.log("Pulling tokens from: " + address);
    console.log(tokens);
  },
});