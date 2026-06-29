import BalanceDisplay from "./components/BalanceDisplay";
import SendTransaction from "./components/SendTransaction";
import WalletConnect from "./components/WalletConnect";
import { useStellarWallet } from "./hooks/useStellarWallet";
import { truncatePublicKey } from "./utils/freighter";

function App() {
  const wallet = useStellarWallet();
  const {
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
  } = wallet;

  return (
    <div className="min-h-screen text-slate-900">
      <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-5xl flex-col gap-4 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-indigo-600">
              Stellar Testnet
            </p>
            <h1 className="text-2xl font-bold text-slate-950">
              Wallet Balance Checker
            </h1>
          </div>
          <div className="flex flex-col gap-2 sm:items-end">
            <div className="flex flex-wrap items-center gap-2 text-sm">
              <span
                className={`h-2.5 w-2.5 rounded-full ${
                  publicKey ? "bg-emerald-500" : "bg-slate-300"
                }`}
              />
              <span className="font-semibold text-slate-700">
                {publicKey ? "Connected" : "Not Connected"}
              </span>
              <span className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2 font-medium text-slate-700">
                {publicKey ? truncatePublicKey(publicKey) : "No wallet"}
              </span>
            </div>
            {publicKey ? (
              <button
                type="button"
                onClick={disconnect}
                disabled={walletLoading}
                className="inline-flex min-h-10 items-center justify-center rounded-md border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {walletLoading ? "Disconnecting..." : "Disconnect"}
              </button>
            ) : (
              <button
                type="button"
                onClick={connect}
                disabled={walletLoading || !freighterInstalled}
                className="inline-flex min-h-10 items-center justify-center rounded-md bg-slate-950 px-3 py-2 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
              >
                {walletLoading ? "Connecting..." : "Connect Wallet"}
              </button>
            )}
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
            onConnect={connect}
            onDisconnect={disconnect}
          />
          <BalanceDisplay
            publicKey={publicKey}
            balance={balance}
            loading={balanceLoading}
            funding={funding}
            error={balanceError}
            onRefresh={refreshBalance}
            onFund={fund}
          />
        </div>

        <SendTransaction publicKey={publicKey} onSend={sendPayment} sending={sending} />
      </main>
    </div>
  );
}

export default App;
