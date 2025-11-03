import { useMutation, useQuery } from "@tanstack/react-query";
import { walletAPI, withdrawalsAPI } from "@/lib/api";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

function genRequestId() {
  return `wd-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export default function Wallet() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { data, isLoading, refetch } = useQuery({ queryKey: ["wallet"], queryFn: walletAPI.getMy });
  const [amount, setAmount] = useState(0);
  const hasCbe = Boolean(user?.cbeAccountName && user?.cbeAccountNumber);
  const last4 = user?.cbeAccountNumber ? String(user.cbeAccountNumber).slice(-4) : '';

  const createMutation = useMutation({
    mutationFn: () =>
      withdrawalsAPI.create({
        amountCents: Math.round(amount * 100),
        clientRequestId: genRequestId(),
      }),
    onSuccess: () => {
      refetch();
      setAmount(0);
    },
  });

  if (isLoading) return <div className="p-6">Loading wallet...</div>;
  if (!user || user.role === 'admin' || user.hostStatus !== 'approved') return <div className="p-6">Only approved hosts can access the wallet.</div>;

  const wallet = data?.data?.wallet;
  const available = (wallet?.availableBalanceCents ?? 0) / 100;
  const pending = (wallet?.pendingPayoutCents ?? 0) / 100;
  const canRequest = hasCbe && amount > 0 && amount <= available;

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Wallet</h1>
          <p className="text-muted-foreground mt-1">Manage your balance and request payouts to your CBE account.</p>
        </div>
        <button onClick={() => navigate(-1)} className="h-9 px-3 rounded border">Back</button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="rounded-lg border p-5 bg-white">
          <p className="text-sm text-muted-foreground">Available</p>
          <p className="mt-1 text-3xl font-semibold">${available.toFixed(2)} <span className="text-base font-normal text-muted-foreground">USD</span></p>
        </div>
        <div className="rounded-lg border p-5 bg-white">
          <p className="text-sm text-muted-foreground">Pending Payout</p>
          <p className="mt-1 text-3xl font-semibold">${pending.toFixed(2)} <span className="text-base font-normal text-muted-foreground">USD</span></p>
        </div>
      </div>

      <div className="rounded-lg border p-5 bg-white space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-medium">Request Withdrawal</h2>
          <span className="text-xs text-muted-foreground">Minimum: $10.00</span>
        </div>
        {!hasCbe ? (
          <div className="text-sm text-amber-800 bg-amber-50 border border-amber-200 rounded p-3">
            No CBE account saved. <Link to="/profile" className="underline">Add your CBE account in Profile</Link>.
          </div>
        ) : (
          <div className="text-sm text-muted-foreground">
            Destination: <span className="text-foreground font-medium">{user?.cbeAccountName}</span> (CBE) • acct ****{last4 || '____'}
            <span className="mx-2">·</span>
            <Link to="/profile" className="underline">Edit in Profile</Link>
          </div>
        )}
        <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-3">
          <label className="block">
            <span className="text-sm">Amount (USD)</span>
            <input
              type="number"
              step="0.01"
              min={0}
              value={amount}
              onChange={(e) => setAmount(parseFloat(e.target.value || '0'))}
              className="mt-1 w-full border rounded px-3 py-2"
              placeholder="0.00"
            />
            <div className="mt-1 text-xs text-muted-foreground">You can withdraw up to ${available.toFixed(2)}.</div>
          </label>
          <button
            disabled={createMutation.isLoading || !canRequest}
            onClick={() => createMutation.mutate()}
            className="self-end h-10 px-4 rounded bg-black text-white disabled:opacity-60"
          >
            {createMutation.isLoading ? "Requesting..." : "Request Withdrawal"}
          </button>
        </div>
        {!hasCbe && (
          <div className="text-xs text-muted-foreground">Set your CBE account to enable withdrawals.</div>
        )}
        {amount > available && (
          <div className="text-xs text-red-600">Amount exceeds available balance.</div>
        )}
        {amount > 0 && amount < 10 && (
          <div className="text-xs text-amber-700">Minimum withdrawal is $10.00.</div>
        )}
        {createMutation.isError && <div className="text-red-600 text-sm">{(createMutation.error as any)?.response?.data?.message || "Request failed"}</div>}
        {createMutation.isSuccess && <div className="text-green-600 text-sm">Withdrawal requested.</div>}
      </div>
    </div>
  );
}
