import { useQuery } from "@tanstack/react-query";
import { withdrawalsAPI } from "@/lib/api";
import { useNavigate } from "react-router-dom";

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    pending_transfer: "bg-amber-100 text-amber-800",
    paid: "bg-emerald-100 text-emerald-800",
    failed: "bg-red-100 text-red-800",
    canceled: "bg-gray-100 text-gray-800",
  };
  const cls = map[status] || "bg-gray-100 text-gray-800";
  return <span className={`px-2 py-0.5 rounded text-xs font-medium ${cls}`}>{status}</span>;
}

export default function MyWithdrawals() {
  const { data, isLoading } = useQuery({ queryKey: ["withdrawals"], queryFn: () => withdrawalsAPI.listMine({ limit: 50 }) });
  const items = data?.data?.withdrawals || [];
  const navigate = useNavigate();

  if (isLoading) return <div className="p-6">Loading withdrawals...</div>;

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Withdrawals</h1>
          <p className="text-muted-foreground mt-1">Track your withdrawal requests and their statuses.</p>
        </div>
        <button onClick={() => navigate(-1)} className="h-9 px-3 rounded border">Back</button>
      </div>

      {items.length === 0 ? (
        <div className="rounded-lg border p-10 text-center bg-white">
          <div className="text-lg font-medium">No withdrawals yet</div>
          <p className="text-sm text-muted-foreground mt-1">Request your first withdrawal from the Wallet page.</p>
        </div>
      ) : (
        <div className="rounded-lg border overflow-x-auto bg-white">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left px-4 py-2">Created</th>
                <th className="text-left px-4 py-2">Amount</th>
                <th className="text-left px-4 py-2">Status</th>
                <th className="text-left px-4 py-2">ID</th>
              </tr>
            </thead>
            <tbody>
              {items.map((w: any) => (
                <tr key={w._id} className="border-t">
                  <td className="px-4 py-2">{new Date(w.createdAt).toLocaleString()}</td>
                  <td className="px-4 py-2 font-medium">${(w.amountCents / 100).toFixed(2)}</td>
                  <td className="px-4 py-2"><StatusBadge status={w.status} /></td>
                  <td className="px-4 py-2 font-mono text-xs">{w._id}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
