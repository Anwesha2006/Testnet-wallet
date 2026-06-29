import { useState } from "react";
import { STELLAR_EXPERT_TESTNET_TX_URL } from "../utils/stellar";

const initialForm = {
  destination: "",
  amount: "",
  memo: "",
};

function SendTransaction({ publicKey, onSend, sending }) {
  const [form, setForm] = useState(initialForm);
  const [feedback, setFeedback] = useState(null);

  const updateField = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setFeedback(null);

    try {
      const result = await onSend(form);
      setFeedback({
        type: "success",
        hash: result.hash,
        message: "Transaction Successful!",
      });
      setForm(initialForm);
    } catch (error) {
      setFeedback({
        type: "error",
        message: error.message || "Transaction failed.",
      });
    }
  };

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-5">
        <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">
          Send
        </p>
        <h2 className="mt-2 text-2xl font-bold text-slate-950">Send XLM</h2>
      </div>

      <form className="grid gap-4" onSubmit={handleSubmit}>
        <label className="grid gap-2">
          <span className="text-sm font-semibold text-slate-700">
            Destination address
          </span>
          <input
            name="destination"
            value={form.destination}
            onChange={updateField}
            disabled={!publicKey || sending}
            placeholder="G..."
            className="min-h-11 rounded-md border border-slate-300 px-3 py-2 text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 disabled:cursor-not-allowed disabled:bg-slate-100"
          />
        </label>

        <label className="grid gap-2">
          <span className="text-sm font-semibold text-slate-700">Amount</span>
          <input
            name="amount"
            value={form.amount}
            onChange={updateField}
            disabled={!publicKey || sending}
            inputMode="decimal"
            placeholder="10.5"
            className="min-h-11 rounded-md border border-slate-300 px-3 py-2 text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 disabled:cursor-not-allowed disabled:bg-slate-100"
          />
        </label>

        <label className="grid gap-2">
          <span className="text-sm font-semibold text-slate-700">
            Memo optional
          </span>
          <input
            name="memo"
            value={form.memo}
            onChange={updateField}
            disabled={!publicKey || sending}
            maxLength={28}
            placeholder="Invoice or note"
            className="min-h-11 rounded-md border border-slate-300 px-3 py-2 text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 disabled:cursor-not-allowed disabled:bg-slate-100"
          />
        </label>

        <button
          type="submit"
          disabled={!publicKey || sending}
          className="mt-2 inline-flex min-h-11 items-center justify-center rounded-md bg-emerald-600 px-4 py-2 font-semibold text-white transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:bg-emerald-300"
        >
          {sending ? "Sending..." : "Send XLM"}
        </button>
      </form>

      {!publicKey ? (
        <p className="mt-4 text-sm text-slate-500">
          Connect a Freighter wallet to enable payments.
        </p>
      ) : null}

      {feedback ? (
        <div
          className={`mt-5 rounded-md border px-4 py-3 text-sm ${
            feedback.type === "success"
              ? "border-emerald-200 bg-emerald-50 text-emerald-800"
              : "border-rose-200 bg-rose-50 text-rose-700"
          }`}
        >
          <p className="font-semibold">{feedback.message}</p>
          {feedback.hash ? (
            <a
              className="mt-2 block break-all underline underline-offset-4"
              href={`${STELLAR_EXPERT_TESTNET_TX_URL}/${feedback.hash}`}
              target="_blank"
              rel="noreferrer"
            >
              {feedback.hash}
            </a>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}

export default SendTransaction;
