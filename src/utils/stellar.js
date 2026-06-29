import {
  Asset,
  Horizon,
  Memo,
  Networks,
  Operation,
  StrKey,
  TransactionBuilder,
} from "@stellar/stellar-sdk";

export const HORIZON_URL = "https://horizon-testnet.stellar.org";
export const STELLAR_EXPERT_TESTNET_TX_URL =
  "https://stellar.expert/explorer/testnet/tx";

export const server = new Horizon.Server(HORIZON_URL);

export function validatePublicKey(publicKey, label = "Stellar address") {
  if (!publicKey || !StrKey.isValidEd25519PublicKey(publicKey.trim())) {
    throw new Error(`${label} must be a valid Stellar public key.`);
  }
}

export function validateAmount(amount) {
  const normalizedAmount = amount.trim();
  const numericAmount = Number(normalizedAmount);

  if (!normalizedAmount || !Number.isFinite(numericAmount) || numericAmount <= 0) {
    throw new Error("Amount must be greater than 0 XLM.");
  }

  if (!/^\d+(\.\d{1,7})?$/.test(normalizedAmount)) {
    throw new Error("Amount can include up to 7 decimal places.");
  }

  return normalizedAmount;
}

export async function loadNativeBalance(publicKey) {
  validatePublicKey(publicKey, "Wallet address");

  try {
    const account = await server.loadAccount(publicKey);
    const nativeBalance = account.balances.find(
      (balance) => balance.asset_type === "native",
    );

    return nativeBalance?.balance ?? "0.0000000";
  } catch (error) {
    if (error?.response?.status === 404) {
      throw new Error(
        "This wallet is not funded on Stellar Testnet yet. Use Friendbot to create and fund it.",
      );
    }

    throw new Error(getStellarErrorMessage(error));
  }
}

export async function fundWithFriendbot(publicKey) {
  validatePublicKey(publicKey, "Wallet address");

  const response = await fetch(
    `https://friendbot.stellar.org?addr=${encodeURIComponent(publicKey)}`,
  );

  if (!response.ok) {
    let message = "Friendbot could not fund this wallet. Please try again shortly.";

    try {
      const payload = await response.json();
      message = payload.detail || payload.title || payload.message || message;
    } catch {
      message = response.statusText || message;
    }

    throw new Error(message);
  }

  return response.json();
}

export async function buildPaymentTransaction({
  sourcePublicKey,
  destination,
  amount,
  memo,
}) {
  validatePublicKey(sourcePublicKey, "Wallet address");
  validatePublicKey(destination, "Destination address");
  const normalizedAmount = validateAmount(amount);

  let sourceAccount;
  let baseFee;

  try {
    [sourceAccount, baseFee] = await Promise.all([
      server.loadAccount(sourcePublicKey),
      server.fetchBaseFee(),
    ]);
  } catch (error) {
    if (error?.response?.status === 404) {
      throw new Error(
        "Your wallet is not funded on Stellar Testnet yet. Use Friendbot before sending XLM.",
      );
    }

    throw new Error(getStellarErrorMessage(error));
  }

  const builder = new TransactionBuilder(sourceAccount, {
    fee: String(baseFee),
    networkPassphrase: Networks.TESTNET,
  }).addOperation(
    Operation.payment({
      destination: destination.trim(),
      asset: Asset.native(),
      amount: normalizedAmount,
    }),
  );

  if (memo.trim()) {
    builder.addMemo(Memo.text(memo.trim()));
  }

  return builder.setTimeout(30).build();
}

export async function submitSignedTransaction(signedTransactionXdr) {
  const transaction = TransactionBuilder.fromXDR(
    signedTransactionXdr,
    Networks.TESTNET,
  );

  try {
    return await server.submitTransaction(transaction);
  } catch (error) {
    throw new Error(getStellarErrorMessage(error));
  }
}

export function getStellarErrorMessage(error) {
  const extras = error?.response?.data?.extras;
  const resultCodes = extras?.result_codes;

  if (resultCodes?.transaction === "tx_insufficient_balance") {
    return "Insufficient XLM balance to complete this transaction.";
  }

  if (resultCodes?.operations?.includes("op_underfunded")) {
    return "Insufficient XLM balance for this payment.";
  }

  if (resultCodes?.operations?.includes("op_no_destination")) {
    return "Destination account does not exist on Stellar Testnet.";
  }

  if (resultCodes?.operations?.includes("op_malformed")) {
    return "The payment details are invalid. Check the destination and amount.";
  }

  if (error?.response?.data?.detail) {
    return error.response.data.detail;
  }

  if (error?.message) {
    return error.message;
  }

  return "Something went wrong while talking to Stellar Testnet.";
}
