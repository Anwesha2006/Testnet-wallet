function BalanceDisplay({
  publicKey,
  balance,
  loading,
  funding,
  error,
  onRefresh,
  onFund,
}) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">
            Balance
          </p>
          <div className="mt-3">
            {publicKey ? (
              <p className="text-4xl font-bold text-slate-950">
                {loading ? "Loading..." : `${balance ?? "0.0000000"} XLM`}
              </p>
            ) : (
              <p className="text-lg font-medium text-slate-500">
                Connect a wallet to view Testnet XLM.
              </p>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row">
          <button
            type="button"
            onClick={onFund}
            disabled={!publicKey || loading || funding}
            className="inline-flex min-h-11 items-center justify-center rounded-md bg-indigo-600 px-4 py-2 font-semibold text-white transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:bg-indigo-300"
          >
            {funding ? "Funding..." : "Fund with Friendbot"}
          </button>
          <button
            type="button"
            onClick={onRefresh}
            disabled={!publicKey || loading || funding}
            className="inline-flex min-h-11 items-center justify-center rounded-md border border-slate-300 px-4 py-2 font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Refreshing..." : "Refresh Balance"}
          </button>
        </div>
      </div>

      {error ? (
        <div className="mt-4 rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          {error}
        </div>
      ) : null}
    </section>
  );
}

export default BalanceDisplay;
