import {
  getAddress,
  getNetwork,
  getPublicKey,
  isConnected,
  requestAccess,
  signTransaction,
} from "@stellar/freighter-api";
import { Networks } from "@stellar/stellar-sdk";

export async function checkFreighterInstalled() {
  const response = await isConnected();

  if (response?.error) {
    throw new Error(getFreighterErrorMessage(response.error));
  }

  return Boolean(response?.isConnected);
}

export async function ensureFreighterTestnet() {
  if (typeof getNetwork !== "function") {
    return;
  }

  const response = await getNetwork();

  if (response?.error) {
    throw new Error(getFreighterErrorMessage(response.error));
  }

  if (response?.network && response.network !== "TESTNET") {
    throw new Error("Switch Freighter to TESTNET before using this app.");
  }
}

export async function connectWallet() {
  const installed = await checkFreighterInstalled();

  if (!installed) {
    throw new Error("Freighter is not installed. Install Freighter to connect a wallet.");
  }

  await ensureFreighterTestnet();

  const accessResponse = await requestAccess();

  if (accessResponse?.error) {
    throw new Error(getFreighterErrorMessage(accessResponse.error));
  }

  const publicKey = accessResponse?.address || (await getConnectedPublicKey());

  if (!publicKey) {
    throw new Error("Freighter did not return a public key.");
  }

  return publicKey;
}

export async function getConnectedPublicKey() {
  const publicKeyResponse =
    typeof getPublicKey === "function" ? await getPublicKey() : await getAddress();

  if (publicKeyResponse?.error) {
    throw new Error(getFreighterErrorMessage(publicKeyResponse.error));
  }

  return publicKeyResponse?.publicKey || publicKeyResponse?.address || "";
}

export function disconnectWallet() {
  return null;
}

export async function signPaymentTransaction(xdr, publicKey) {
  const response = await signTransaction(xdr, {
    networkPassphrase: Networks.TESTNET,
    address: publicKey,
  });

  if (response?.error) {
    throw new Error(getFreighterErrorMessage(response.error));
  }

  if (!response?.signedTxXdr) {
    throw new Error("Freighter did not return a signed transaction.");
  }

  return response.signedTxXdr;
}

export function truncatePublicKey(publicKey) {
  if (!publicKey) {
    return "";
  }

  return `${publicKey.slice(0, 6)}...${publicKey.slice(-4)}`;
}

function getFreighterErrorMessage(error) {
  if (typeof error === "string") {
    return error;
  }

  return error?.message || "Freighter rejected the request.";
}
