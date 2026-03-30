"use client";

import { useEffect, useState, useMemo } from "react";
import { Sidebar } from "@/app/components/Sidebar"; // Adjust path if needed
import { 
  Search, 
  CreditCard, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Clock, 
  Building2,
  FileText,
  CheckCircle2,
  XCircle
} from "lucide-react";
import { getAllTransactionDetails } from "@/app/utility/api"; // Adjust path if needed

type RazorpayTransaction = {
  id: string;
  amount: number;
  currency: string;
  status: string;
  method: string;
  bank: string | null;
  email: string;
  contact: string;
  created_at: number;
  description: string | null;
};

export default function TransactionHistoryPage() {
  const [transactions, setTransactions] = useState<RazorpayTransaction[]>([]);
  const [filteredTransactions, setFilteredTransactions] = useState<RazorpayTransaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchTransactions = async () => {
      setIsLoading(true);
      try {
        const response = await getAllTransactionDetails();
        
        // Handle Razorpay's paginated/collection response structure
        let parsedTransactions: RazorpayTransaction[] = [];
        if (response?.items && Array.isArray(response.items)) {
          parsedTransactions = response.items;
        } else if (Array.isArray(response)) {
          parsedTransactions = response;
        }

        // Sort newest first
        parsedTransactions.sort((a, b) => b.created_at - a.created_at);

        setTransactions(parsedTransactions);
        setFilteredTransactions(parsedTransactions);
      } catch (error) {
        console.error("Failed to fetch transactions:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTransactions();
  }, []);

  // Handle Search Filtering
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredTransactions(transactions);
    } else {
      const lowerQuery = searchQuery.toLowerCase();
      const filtered = transactions.filter(
        (txn) => 
          txn.id.toLowerCase().includes(lowerQuery) || 
          (txn.email && txn.email.toLowerCase().includes(lowerQuery)) ||
          (txn.method && txn.method.toLowerCase().includes(lowerQuery)) ||
          (txn.description && txn.description.toLowerCase().includes(lowerQuery))
      );
      setFilteredTransactions(filtered);
    }
  }, [searchQuery, transactions]);

  // Metrics
  const { totalVolume, successCount, failedCount } = useMemo(() => {
    let vol = 0;
    let success = 0;
    let failed = 0;

    transactions.forEach(txn => {
      const isSuccess = txn.status === "captured" || txn.status === "paid" || txn.status === "SUCCESS";
      if (isSuccess) {
        vol += (txn.amount / 100); // Convert paise to INR
        success++;
      } else {
        failed++;
      }
    });

    return { totalVolume: vol, successCount: success, failedCount: failed };
  }, [transactions]);

  return (
    <div className="flex min-h-screen bg-[#F2F2F2] font-sans text-[#111110]">
      
      <main className="flex-1 px-[clamp(20px,4vw,40px)] py-[clamp(24px,4vw,40px)] transition-[margin-left] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] max-md:ml-[68px]">
        <div className="mx-auto max-w-[1200px]">
          
          {/* ── Header ── */}
          <div className="mb-8 flex flex-wrap items-center justify-between gap-4 rounded-[14px] border border-black/[0.06] bg-white p-6 shadow-sm">
            <div>
              <div className="mb-1 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#5B7FA6]/10">
                  <CreditCard size={20} className="text-[#5B7FA6]" />
                </div>
                <h1 className="text-[22px] font-bold tracking-[-0.03em] text-[#111110]">
                  Transaction Ledger
                </h1>
              </div>
              <p className="text-[13.5px] text-[#929090]">
                A comprehensive record of all inward and outward gateway payments.
              </p>
            </div>
            <div className="text-right">
              <p className="text-[11px] font-semibold uppercase tracking-[0.06em] text-[#929090]">Total Processed Volume</p>
              <p className="font-mono text-[28px] font-bold text-[#111110]">
                ₹{totalVolume.toLocaleString('en-IN')}
              </p>
            </div>
          </div>

          {/* ── Metrics Row ── */}
          <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="rounded-[14px] border border-black/[0.06] bg-white p-5 shadow-sm">
              <p className="text-[11px] font-semibold uppercase tracking-[0.06em] text-[#929090]">Total Transactions</p>
              <p className="mt-1 font-mono text-[32px] font-bold tracking-tight text-[#111110]">
                {transactions.length}
              </p>
            </div>
            <div className="rounded-[14px] border border-[#28CA41]/30 bg-[#28CA41]/5 p-5 shadow-sm">
              <p className="text-[11px] font-semibold uppercase tracking-[0.06em] text-[#1a8c30]">Successful Settled</p>
              <p className="mt-1 font-mono text-[32px] font-bold tracking-tight text-[#1a8c30]">
                {successCount}
              </p>
            </div>
            <div className="rounded-[14px] border border-[#FF5F57]/30 bg-[#FF5F57]/5 p-5 shadow-sm">
              <p className="text-[11px] font-semibold uppercase tracking-[0.06em] text-[#c53030]">Failed / Dropped</p>
              <p className="mt-1 font-mono text-[32px] font-bold tracking-tight text-[#c53030]">
                {failedCount}
              </p>
            </div>
          </div>

          {/* ── Controls Row ── */}
          <div className="mb-6 flex items-center justify-between gap-4">
            <div className="relative w-full max-w-[400px]">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#929090]" />
              <input
                type="text"
                placeholder="Search by TXN ID, email, or method..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-[10px] border border-black/10 bg-white py-2.5 pl-10 pr-4 text-[13.5px] outline-none transition-colors focus:border-[#111110]"
              />
            </div>
            <div className="text-[13px] font-medium text-[#929090]">
              Showing <span className="font-bold text-[#111110]">{filteredTransactions.length}</span> records
            </div>
          </div>

          {/* ── Transactions Table ── */}
          <div className="overflow-hidden rounded-[14px] border border-black/[0.06] bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-black/[0.06] bg-[#FAFAFA]">
                    <th className="whitespace-nowrap px-6 py-4 text-[11px] font-semibold uppercase tracking-[0.06em] text-[#929090]">Transaction Details</th>
                    <th className="px-6 py-4 text-[11px] font-semibold uppercase tracking-[0.06em] text-[#929090]">Customer / Vendor info</th>
                    <th className="px-6 py-4 text-[11px] font-semibold uppercase tracking-[0.06em] text-[#929090]">Payment Method</th>
                    <th className="whitespace-nowrap px-6 py-4 text-right text-[11px] font-semibold uppercase tracking-[0.06em] text-[#929090]">Amount (INR)</th>
                    <th className="whitespace-nowrap px-6 py-4 text-center text-[11px] font-semibold uppercase tracking-[0.06em] text-[#929090]">Status</th>
                  </tr>
                </thead>
                <tbody className="text-[13.5px] text-[#111110]">
                  {isLoading ? (
                    <tr>
                      <td colSpan={5} className="py-16 text-center">
                        <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-[3px] border-[#111110] border-r-transparent" />
                        <p className="text-[#929090]">Loading transaction ledger...</p>
                      </td>
                    </tr>
                  ) : filteredTransactions.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-16 text-center text-[#929090]">
                        No transactions found matching your criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredTransactions.map((txn) => {
                      const amountInInr = txn.amount / 100;
                      const isSuccess = txn.status === "captured" || txn.status === "paid" || txn.status === "SUCCESS";
                      const isPending = txn.status === "created" || txn.status === "authorized";
                      const date = new Date(txn.created_at * 1000).toLocaleString(undefined, { 
                        month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' 
                      });

                      return (
                        <tr key={txn.id} className="border-b border-black/[0.04] transition-colors hover:bg-[#FAFAFA]">
                          
                          {/* Transaction Details */}
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-md ${isSuccess ? 'bg-[#28CA41]/10' : isPending ? 'bg-[#FFBD2E]/10' : 'bg-[#FF5F57]/10'}`}>
                                {isSuccess ? (
                                  <ArrowUpRight size={14} className="text-[#1a8c30]" />
                                ) : isPending ? (
                                  <Clock size={14} className="text-[#9a6e00]" />
                                ) : (
                                  <ArrowDownLeft size={14} className="text-[#c53030]" />
                                )}
                              </div>
                              <div>
                                <p className="font-mono text-[12px] font-bold text-[#111110]">{txn.id}</p>
                                <p className="text-[11px] text-[#929090]">{date}</p>
                              </div>
                            </div>
                          </td>

                          {/* Customer Info */}
                          <td className="px-6 py-4">
                            <p className="font-medium text-[#111110]">{txn.email || "N/A"}</p>
                            {txn.contact && <p className="font-mono text-[11px] text-[#929090]">{txn.contact}</p>}
                            {txn.description && <p className="mt-1 text-[11px] text-[#5B7FA6]">{txn.description}</p>}
                          </td>

                          {/* Method */}
                          <td className="px-6 py-4">
                            <div className="inline-flex items-center gap-1.5 rounded-md border border-black/5 bg-[#F2F2F2] px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.04em] text-[#4C433F]">
                              <Building2 size={12} className="text-[#929090]" />
                              {txn.method} {txn.bank ? `· ${txn.bank}` : ''}
                            </div>
                          </td>

                          {/* Amount */}
                          <td className="whitespace-nowrap px-6 py-4 text-right font-mono text-[16px] font-bold text-[#111110]">
                            ₹{amountInInr.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </td>

                          {/* Status */}
                          <td className="whitespace-nowrap px-6 py-4 text-center">
                            {isSuccess ? (
                              <span className="inline-flex items-center gap-1.5 rounded-full border border-[#28CA41]/20 bg-[#28CA41]/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.04em] text-[#1a8c30]">
                                <CheckCircle2 size={12} /> Settled
                              </span>
                            ) : isPending ? (
                              <span className="inline-flex items-center gap-1.5 rounded-full border border-[#FFBD2E]/20 bg-[#FFBD2E]/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.04em] text-[#9a6e00]">
                                <Clock size={12} /> {txn.status}
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 rounded-full border border-[#FF5F57]/20 bg-[#FF5F57]/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.04em] text-[#c53030]">
                                <XCircle size={12} /> {txn.status}
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}