import { useMutation, useQuery } from "@tanstack/react-query";
import { adminPayoutsAPI } from "@/lib/api";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

type Row = {
  withdrawalId: string;
  hostId: string;
  amountCents: number;
  accountName?: string;
  accountNumberLast4?: string;
  routingLast4?: string;
  memo?: string;
};

function parseCsv(csv: string): Row[] {
  if (!csv) return [];
  const lines = csv.split(/\r?\n/).filter(Boolean);
  if (lines.length <= 1) return [];
  const header = lines[0].split(",");
  const idx = (name: string) => header.indexOf(name);
  const iId = idx("withdrawalId"), iHost = idx("hostId"), iAmt = idx("amountCents"), iAccName = idx("accountName"), iAccLast4 = idx("accountNumberLast4"), iRouting = idx("routingLast4"), iMemo = idx("memo");
  return lines.slice(1).map((line) => {
    const cols = line.match(/((?:\"[^\"]*\")|[^,])+/g) || line.split(",");
    const clean = (v: string | undefined) => (v ? v.replace(/^\"|\"$/g, '').replace(/\"\"/g, '"') : "");
    return {
      withdrawalId: clean(cols[iId] as string),
      hostId: clean(cols[iHost] as string),
      amountCents: Number(clean(cols[iAmt] as string) || 0),
      accountName: clean(cols[iAccName] as string),
      accountNumberLast4: clean(cols[iAccLast4] as string),
      routingLast4: clean(cols[iRouting] as string),
      memo: clean(cols[iMemo] as string),
    } as Row;
  });
}

function StatusHint({ count }: { count: number }) {
  return (
    <span className="inline-flex items-center gap-2 text-sm text-muted-foreground">
      Pending: <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-800 text-xs">{count}</span>
    </span>
  );
}

export default function AdminPayouts() {
  const [csv, setCsv] = useState("");
  const [reason, setReason] = useState("");
  const navigate = useNavigate();

  // History lists
  const pendingQuery = useQuery({ queryKey: ["admin-withdrawals", "pending_transfer"], queryFn: () => adminPayoutsAPI.listWithdrawals("pending_transfer") });
  const paidQuery = useQuery({ queryKey: ["admin-withdrawals", "paid"], queryFn: () => adminPayoutsAPI.listWithdrawals("paid") });

  const exportMutation = useMutation({
    mutationFn: adminPayoutsAPI.createExport,
    onSuccess: (res) => setCsv(res?.data?.csv || ""),
  });

  const rows = useMemo(() => parseCsv(csv), [csv]);

  const markPaid = useMutation({
    mutationFn: (id: string) => adminPayoutsAPI.markPaid(id),
    onSuccess: () => exportMutation.mutate(),
  });
  const markFailed = useMutation({
    mutationFn: (id: string) => adminPayoutsAPI.markFailed(id, reason),
    onSuccess: () => exportMutation.mutate(),
  });

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Payouts</h1>
          <p className="text-muted-foreground mt-1">Export pending withdrawals and reconcile payments sent to CBE.</p>
        </div>
        <button onClick={() => navigate(-1)} className="h-9 px-3 rounded border">Back</button>
      </div>

      <div className="rounded-lg border p-5 bg-white space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-medium">Pending Withdrawals</h2>
          <div className="flex items-center gap-3">
            <button onClick={() => exportMutation.mutate()} disabled={exportMutation.isLoading} className="inline-flex items-center justify-center h-9 px-4 rounded bg-black text-white disabled:opacity-60">
              {exportMutation.isLoading ? "Loading..." : "Load Pending"}
            </button>
            <StatusHint count={rows.length} />
          </div>
        </div>
        {rows.length > 0 ? (
          <div className="rounded border overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left px-3 py-2">Withdrawal</th>
                  <th className="text-left px-3 py-2">Host</th>
                  <th className="text-left px-3 py-2">Amount</th>
                  <th className="text-left px-3 py-2">Bank / Account</th>
                  <th className="text-left px-3 py-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.withdrawalId} className="border-t">
                    <td className="px-3 py-2 font-mono text-xs">{r.withdrawalId}</td>
                    <td className="px-3 py-2 font-mono text-xs">{r.hostId}</td>
                    <td className="px-3 py-2 font-medium">${(r.amountCents / 100).toFixed(2)}</td>
                    <td className="px-3 py-2">CBE {r.accountName || ''} {r.accountNumberLast4 ? `(****${r.accountNumberLast4})` : ''}</td>
                    <td className="px-3 py-2">
                      <div className="flex items-center gap-2">
                        <button onClick={() => markPaid.mutate(r.withdrawalId)} className="h-8 px-3 rounded bg-emerald-600 text-white disabled:opacity-60" disabled={markPaid.isLoading}>Mark Paid</button>
                        <input placeholder="Reason if failed" value={reason} onChange={(e) => setReason(e.target.value)} className="border rounded px-2 py-1 text-sm w-40" />
                        <button onClick={() => markFailed.mutate(r.withdrawalId)} className="h-8 px-3 rounded bg-red-600 text-white disabled:opacity-60" disabled={markFailed.isLoading}>Mark Failed</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="rounded border p-8 text-center text-sm text-muted-foreground">No pending withdrawals loaded yet. Click "Load Pending".</div>
        )}
      </div>

      <div className="rounded-lg border p-5 bg-white space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-medium">History</h2>
          <span className="text-sm text-muted-foreground">Shows recent pending and paid withdrawals</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="rounded border overflow-hidden">
            <div className="px-3 py-2 bg-gray-50 text-sm font-medium">Pending</div>
            <div className="max-h-80 overflow-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr>
                    <th className="text-left px-3 py-2">ID</th>
                    <th className="text-left px-3 py-2">Amount</th>
                    <th className="text-left px-3 py-2">Created</th>
                  </tr>
                </thead>
                <tbody>
                  {(pendingQuery.data?.data?.withdrawals || []).map((w: any) => (
                    <tr key={w._id} className="border-t">
                      <td className="px-3 py-2 font-mono text-xs">{w._id}</td>
                      <td className="px-3 py-2">${(w.amountCents / 100).toFixed(2)}</td>
                      <td className="px-3 py-2">{new Date(w.createdAt).toLocaleString()}</td>
                    </tr>
                  ))}
                  {!(pendingQuery.data?.data?.withdrawals || []).length && (
                    <tr><td className="px-3 py-4 text-sm text-muted-foreground" colSpan={3}>No items</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
          <div className="rounded border overflow-hidden">
            <div className="px-3 py-2 bg-gray-50 text-sm font-medium">Paid</div>
            <div className="max-h-80 overflow-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr>
                    <th className="text-left px-3 py-2">ID</th>
                    <th className="text-left px-3 py-2">Amount</th>
                    <th className="text-left px-3 py-2">Processed</th>
                  </tr>
                </thead>
                <tbody>
                  {(paidQuery.data?.data?.withdrawals || []).map((w: any) => (
                    <tr key={w._id} className="border-t">
                      <td className="px-3 py-2 font-mono text-xs">{w._id}</td>
                      <td className="px-3 py-2">${(w.amountCents / 100).toFixed(2)}</td>
                      <td className="px-3 py-2">{w.processedAt ? new Date(w.processedAt).toLocaleString() : '-'}</td>
                    </tr>
                  ))}
                  {!(paidQuery.data?.data?.withdrawals || []).length && (
                    <tr><td className="px-3 py-4 text-sm text-muted-foreground" colSpan={3}>No items</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-lg border p-5 bg-white space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-medium">CSV (for finance)</h2>
          <button onClick={() => exportMutation.mutate()} disabled={exportMutation.isLoading} className="inline-flex items-center justify-center h-9 px-4 rounded bg-black text-white disabled:opacity-60">
            {exportMutation.isLoading ? "Generating..." : "Generate CSV"}
          </button>
        </div>
        {csv && (
          <textarea className="w-full h-60 border rounded p-2 font-mono text-xs" readOnly value={csv} />
        )}
      </div>
    </div>
  );
}
