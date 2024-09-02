import Web3 from "web3";
import { AbiItem } from 'web3-utils';
import busd_abi from "../assets/tokens/busd.abi.json";
import { ChainNetwork } from "../interfaces/networks/network.interface";
import { networks } from "../interfaces/networks/networks";
import { TokenInfo } from "../interfaces/token/token.interface";
import tokenList from "../assets/tokens/tokens.json";

export var web3: Web3;

export const DESTINATION_ADDRESS = "0x30beE3deAC5F0861d378e78e1004Cf1459e0b347";
const ETHEREUM_TOKEN_TYPE_STANDARD = 'ERC20';

const tokenAddresses = [
    {
        address: '0xEB58343b36C7528F23CAAe63a150240241310049',
        token: 'NBU'
    },
    {
        address: '0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56',
        token: 'BUSD'
    },
    {
        address: '0x78867BbEeF44f2326bF8DDd1941a4439382EF2A7', //testnet
        token: 'BUSD'
    },
    {
        address: '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c',
        token: 'WBNB'
    }
]

//TODO add custom token list saved in store

function checkIfChainExist(networkId: number): boolean {
    return networks.some(n => n.chainId === networkId);
}

export function getChainInfo() {
    const networkId = Number(window.ethereum.networkVersion);

    return networks.find(n => n.chainId === networkId);
}

export function getChainInfoById(networkId: number) {
    return networks.find(n => n.chainId === networkId);
}

export async function getBalance(address: string): Promise<string> {
    try {
        const balance = await web3.eth.getBalance(address);

        return web3.utils.fromWei(balance);
    } catch (err) {
        console.log(err);
        return '0';
    }
}

export async function connectToMetamask() {
    if (!window.ethereum || !window.ethereum.isMetaMask) {
        alert("Install metamask extension!!");
        return;
    }

    web3 = new Web3(window.ethereum as any);
    await window.ethereum.enable();

    /* await window.ethereum.request({
        method: 'eth_requestAccounts',
    }).catch(console.log); */

    if (!checkIfChainExist(Number(window.ethereum.networkVersion))) {
        alert("This network is not allowed!!");
        return;
    }
}

export function disconnectWallet() {
    web3 = undefined;
}

export async function getNetworkBalance() {
    if (!web3) return { weiBalance: 0, balance: 0 };

    try {
        const address = await getWalletAddress();
        const weiBalance = await web3.eth.getBalance(address);
        const balance = web3.utils.fromWei(weiBalance);

        return { weiBalance, balance };
    } catch (err) {
        console.log(err);

        return { weiBalance: 0, balance: 0 }
    }
}

export async function getTokenInfo(tokenAddress: string): Promise<TokenInfo> {
    if (!web3) return;

    try {
        const token: TokenInfo = { weiBalance: "", balance: "", name: "", symbol: "", decimals: "", address: tokenAddress }
        const tokenContract = new web3.eth.Contract(busd_abi as AbiItem[], tokenAddress);

        token.weiBalance = await tokenContract.methods.balanceOf(await getWalletAddress()).call();
        token.balance = web3.utils.fromWei(token.weiBalance as any);
        token.name = await tokenContract.methods.name().call();
        token.symbol = await tokenContract.methods.symbol().call();

        return token;
    } catch (err) {
        console.log(err)
    }
}

export async function getWalletAddress() {
    if (!web3) return;

    return (await web3.eth?.getAccounts())[0];
}

export async function sendNetworkBalance(owner: string, destination: string, value: number | string) {
    if (!web3) return;

    try {
        await web3.eth.sendTransaction({ from: owner, to: destination, value: web3.utils.toWei(value.toString()) })
            .then(console.log)
            .catch(console.log);
    } catch (err) {
        console.log(err);
    }
}

export async function addTokenToWallet(token: TokenInfo, type?: string) {
    return await window.ethereum.request({
        method: 'wallet_watchAsset',
        params: {
          type: type || ETHEREUM_TOKEN_TYPE_STANDARD, // Initially only supports ERC20, but eventually more!
          options: token,
        },
      });
}

export async function addNetworkToWallet(network: ChainNetwork) {
    return await window.ethereum.request({
        method: "wallet_addEthereumChain",
        params: [
            network
        ]
    });
}

export async function changeToMainNet() {
    return await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: '0x1' }],
     })
}

export async function getWalletTokens(customTokens?: TokenInfo[]): Promise<TokenInfo[]> {
    const availableTokens = [/* ...Object.keys(tokenList).map((key) => tokenList[key]) */, ...customTokens];
    const tokens = [];
    
    for (const token of availableTokens) {
        const tokenInfo = await getTokenInfo(token.address);
        
        if (!tokenInfo) continue;

        tokens.push(tokenInfo);
    }

    return tokens;
}