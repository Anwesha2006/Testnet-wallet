import { useCallback, useEffect, useState } from "react";
import BalanceDisplay from "./components/BalanceDisplay";
import SendTransaction from "./components/SendTransaction";
import WalletConnect from "./components/WalletConnect";
import {
  buildPaymentTransaction,
  fundWithFriendbot,
  loadNativeBalance,
  submitSignedTransaction,
} from "./utils/stellar";
import {
  checkFreighterInstalled,
  connectWallet,
  disconnectWallet,
  getConnectedPublicKey,
  signPaymentTransaction,
} from "./utils/freighter";

function App() {
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

        if (installed) {
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

  const handleConnect = async () => {
    setWalletLoading(true);
    setWalletError("");

    try {
      const connectedPublicKey = await connectWallet();
      setPublicKey(connectedPublicKey);
    } catch (error) {
      setWalletError(error.message);
    } finally {
      setWalletLoading(false);
    }
  };

  const handleDisconnect = () => {
    disconnectWallet();
    setPublicKey("");
    setBalance(null);
    setBalanceError("");
    setWalletError("");
  };

  const handleFund = async () => {
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

  const handleSend = async ({ destination, amount, memo }) => {
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
      const signedXdr = await signPaymentTransaction(transaction.toXDR(), publicKey);
      const result = await submitSignedTransaction(signedXdr);
      await refreshBalance();
      return result;
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="min-h-screen text-slate-900">
      <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-5xl flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-indigo-600">
              Stellar Testnet
            </p>
            <h1 className="text-2xl font-bold text-slate-950">
              Wallet Balance Checker
            </h1>
          </div>
          <div className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-medium text-slate-700">
            {publicKey ? `${publicKey.slice(0, 6)}...${publicKey.slice(-4)}` : "No wallet"}
          </div>
        </div>
      </header>

      <main className="mx-auto grid max-w-5xl gap-5 px-4 py-6 sm:px-6 lg:grid-cols-[1fr_1fr]">
        <div className="grid content-start gap-5">
          <WalletConnect
            publicKey={publicKey}
            installed={freighterInstalled}
            loading={walletLoading}
            error={walletError}
            onConnect={handleConnect}
            onDisconnect={handleDisconnect}
          />
          <BalanceDisplay
            publicKey={publicKey}
            balance={balance}
            loading={balanceLoading}
            funding={funding}
            error={balanceError}
            onRefresh={refreshBalance}
            onFund={handleFund}
          />
        </div>

        <SendTransaction publicKey={publicKey} onSend={handleSend} sending={sending} />
      </main>
    </div>
  );
}

export default App;
