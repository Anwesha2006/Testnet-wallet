import { useCallback, useEffect, useState } from "react";
import {
  buildPaymentTransaction,
  fundWithFriendbot,
  loadNativeBalance,
  submitSignedTransaction,
} from "../utils/stellar";
import {
  checkFreighterInstalled,
  connectWallet,
  disconnectWallet,
  getConnectedPublicKey,
  signPaymentTransaction,
} from "../utils/freighter";

const WALLET_DISCONNECTED_KEY = "stellar-testnet-wallet-disconnected";

export function useStellarWallet() {
  const [publicKey, setPublicKey] = useState("");
  const [freighterInstalled, setFreighterInstalled] = useState(false);
  const [walletLoading, setWalletLoading] = useState(true);
  const [walletError, setWalletError] = useState("");
  const [balance, setBalance] = useState(null);
  const [balanceLoading, setBalanceLoading] = useState(false);
  const [balanceError, setBalanceError] = useState("");
  const [funding, setFunding] = useState(false);
  const [sending, setSending] = useState(false);

  const refreshBalance = useCallback(async () => {
    if (!publicKey) {
      setBalance(null);
      return;
    }

    setBalanceLoading(true);
    setBalanceError("");

    try {
      const nativeBalance = await loadNativeBalance(publicKey);
      setBalance(nativeBalance);
    } catch (error) {
      setBalance(null);
      setBalanceError(error.message);
    } finally {
      setBalanceLoading(false);
    }
  }, [publicKey]);

  useEffect(() => {
    const initializeWallet = async () => {
      setWalletLoading(true);
      setWalletError("");

      try {
        const installed = await checkFreighterInstalled();
        setFreighterInstalled(installed);

        const disconnectedForSession =
          window.sessionStorage.getItem(WALLET_DISCONNECTED_KEY) === "true";

        if (installed && !disconnectedForSession) {
          const connectedPublicKey = await getConnectedPublicKey();
          setPublicKey(connectedPublicKey);
        }
      } catch (error) {
        setWalletError(error.message);
      } finally {
        setWalletLoading(false);
      }
    };

    initializeWallet();
  }, []);

  useEffect(() => {
    refreshBalance();
  }, [refreshBalance]);

  const connect = async () => {
    setWalletLoading(true);
    setWalletError("");

    try {
      const connectedPublicKey = await connectWallet();
      window.sessionStorage.removeItem(WALLET_DISCONNECTED_KEY);
      setPublicKey(connectedPublicKey);
    } catch (error) {
      setWalletError(error.message);
    } finally {
      setWalletLoading(false);
    }
  };

  const disconnect = async () => {
    setWalletLoading(true);
    setWalletError("");

    try {
      await disconnectWallet();
      window.sessionStorage.setItem(WALLET_DISCONNECTED_KEY, "true");
      setPublicKey("");
      setBalance(null);
      setBalanceError("");
    } catch (error) {
      setWalletError(error.message);
    } finally {
      setWalletLoading(false);
    }
  };

  const fund = async () => {
    if (!publicKey) {
      return;
    }

    setFunding(true);
    setBalanceError("");

    try {
      await fundWithFriendbot(publicKey);
      await refreshBalance();
    } catch (error) {
      setBalanceError(error.message);
    } finally {
      setFunding(false);
    }
  };

  const sendPayment = async ({ destination, amount, memo }) => {
    if (!publicKey) {
      throw new Error("Connect a wallet before sending XLM.");
    }

    setSending(true);

    try {
      const transaction = await buildPaymentTransaction({
        sourcePublicKey: publicKey,
        destination,
        amount,
        memo,
      });

      // Freighter shows the approval prompt and returns signed XDR only after user approval.
      const signedXdr = await signPaymentTransaction(transaction.toXDR(), publicKey);
      const result = await submitSignedTransaction(signedXdr);
      await refreshBalance();

      return {
        hash: result.hash,
        amount: amount.trim(),
        destination: destination.trim(),
      };
    } finally {
      setSending(false);
    }
  };

  return {
    publicKey,
    freighterInstalled,
    walletLoading,
    walletError,
    balance,
    balanceLoading,
    balanceError,
    funding,
    sending,
    connect,
    disconnect,
    fund,
    refreshBalance,
    sendPayment,
  };
}
