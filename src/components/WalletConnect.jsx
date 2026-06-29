import { truncatePublicKey } from "../utils/freighter";

function WalletConnect({
  publicKey,
  installed,
  loading,
  error,
  onConnect,
  onDisconnect,
}) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">
            Wallet
          </p>
          <div className="mt-2 flex flex-wrap items-center gap-3">
            <span
              className={`h-2.5 w-2.5 rounded-full ${
                publicKey ? "bg-emerald-500" : "bg-slate-300"
              }`}
            />
            <p className="text-lg font-semibold text-slate-950">
              {publicKey ? truncatePublicKey(publicKey) : "Not connected"}
            </p>
          </div>
          <p className="mt-1 text-sm text-slate-500">
            {installed
              ? "Freighter detected. Network: Testnet."
              : "Freighter extension not detected."}
          </p>
        </div>

        {publicKey ? (
          <button
            type="button"
            onClick={onDisconnect}
            disabled={loading}
            className="inline-flex min-h-11 items-center justify-center rounded-md border border-slate-300 px-4 py-2 font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Disconnect
          </button>
        ) : (
          <button
            type="button"
            onClick={onConnect}
            disabled={loading || !installed}
            className="inline-flex min-h-11 items-center justify-center rounded-md bg-slate-950 px-4 py-2 font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
          >
            {loading ? "Connecting..." : "Connect Wallet"}
          </button>
        )}
      </div>

      {error ? (
        <div className="mt-4 rounded-md border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {error}
        </div>
      ) : null}
    </section>
  );
}

export default WalletConnect;
