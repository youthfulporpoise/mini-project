"use client";

import { useEffect, useMemo, useState } from "react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import { Wallet, CheckCircle2, Clock, FileText, AlertTriangle } from "lucide-react";
import TransactionHistory from "./TransactionHistory";
import { fetchQuotations, fetchResponses } from "../utility/api";

type QuotationRequestRow = {
  quotation_id: number;
  requirements: string;
  product_category: string;
  status: "Pending" | "Under Review" | "Approved" | "Rejected";
  created_date: string;
};

type VendorResponseRow = {
  quotation_id: number;
  amount: number;
};

const STATUS_LABELS: Record<number, QuotationRequestRow["status"]> = {
  0: "Pending",
  2: "Under Review",
  1: "Approved",
  3: "Rejected",
};

// Muted, professional palette for the Pie Chart matching the theme
const CATEGORY_COLORS = [
  "#111110", // Dark Ink
  "#5B7FA6", // Muted Blue
  "#FB4D27", // Accent Orange
  "#28CA41", // Success Green
  "#FFBD2E", // Warning Yellow
  "#8C8C8C", // Neutral Gray
];

const mapQuotationStatus = (status: number): QuotationRequestRow["status"] =>
  STATUS_LABELS[status] ?? "Pending";

const getRepresentativeQuotationValue = (
  quotationId: number,
  vendorResponses: VendorResponseRow[],
) => {
  const responses = vendorResponses.filter((v) => v.quotation_id === quotationId);
  if (responses.length === 0) return 0;
  return Math.min(...responses.map((r) => r.amount));
};

export default function Dashboard() {
  const [quotationRequests, setQuotationRequests] = useState<QuotationRequestRow[]>([]);
  const [vendorResponses, setVendorResponses] = useState<VendorResponseRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);

        const [quotationsData, responsesData] = await Promise.all([
          fetchQuotations(),
          fetchResponses(),
        ]);

        const mappedQuotations: QuotationRequestRow[] = quotationsData.map(
          (quotation: any) => ({
            quotation_id: quotation.id,
            requirements: quotation.description || quotation.title,
            product_category: quotation.category,
            status: mapQuotationStatus(quotation.status),
            created_date: quotation.submission_deadline,
          })
        );

        // Handle array vs wrapped object based on your Axios setup
        const validResponses = Array.isArray(responsesData) ? responsesData : responsesData.data;
        const mappedResponses: VendorResponseRow[] = validResponses.flatMap(
          (response: any) =>
            response.response_items.map((item: any) => ({
              quotation_id: response.quotation,
              amount: item.unit_price,
            }))
        );

        setQuotationRequests(mappedQuotations);
        setVendorResponses(mappedResponses);
      } catch (err) {
        console.error("Dashboard fetch error:", err);
        setError(err instanceof Error ? err.message : "Something went wrong fetching data.");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const totalQuotationsValue = useMemo(() => {
    return vendorResponses.reduce((sum, response) => sum + response.amount, 0);
  }, [vendorResponses]);

  const approvedQuotations = useMemo(() => quotationRequests.filter((q) => q.status === "Approved"), [quotationRequests]);
  const pendingQuotations = useMemo(() => quotationRequests.filter((q) => q.status === "Pending" || q.status === "Under Review"), [quotationRequests]);

  const approvedAmount = useMemo(() => {
    return approvedQuotations.reduce(
      (sum, q) => sum + getRepresentativeQuotationValue(q.quotation_id, vendorResponses),
      0
    );
  }, [approvedQuotations, vendorResponses]);

  const pendingValue = useMemo(() => {
    return pendingQuotations.reduce(
      (sum, q) => sum + getRepresentativeQuotationValue(q.quotation_id, vendorResponses),
      0
    );
  }, [pendingQuotations, vendorResponses]);

  const monthlyTrend = useMemo(() => {
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const monthlyMap = new Map<string, number>();

    approvedQuotations.forEach((q) => {
      const date = new Date(q.created_date);
      if (!isNaN(date.getTime())) {
        const month = monthNames[date.getMonth()];
        const value = getRepresentativeQuotationValue(q.quotation_id, vendorResponses);
        monthlyMap.set(month, (monthlyMap.get(month) || 0) + value);
      }
    });

    return monthNames.map((month) => ({
      month,
      expenses: monthlyMap.get(month) || 0,
    }));
  }, [approvedQuotations, vendorResponses]);

  const expenseByCategory = useMemo(() => {
    const categoryMap = new Map<string, number>();

    approvedQuotations.forEach((q) => {
      const value = getRepresentativeQuotationValue(q.quotation_id, vendorResponses);
      const catName = q.product_category || "Uncategorized";
      categoryMap.set(catName, (categoryMap.get(catName) || 0) + value);
    });

    const total = Array.from(categoryMap.values()).reduce((sum, val) => sum + val, 0);

    return Array.from(categoryMap.entries()).map(([category, amount], index) => ({
      name: category, // rechart prefers 'name'
      amount,
      percentage: total > 0 ? ((amount / total) * 100).toFixed(1) : "0.0",
      color: CATEGORY_COLORS[index % CATEGORY_COLORS.length],
    }));
  }, [approvedQuotations, vendorResponses]);


  if (loading) {
    return (
      <div className="flex h-[60vh] flex-col items-center justify-center text-[#929090]">
        <div className="mb-4 h-8 w-8 animate-spin rounded-full border-[3px] border-[#111110] border-r-transparent" />
        <p className="text-[13px] font-medium text-[#111110]">Loading dashboard metrics...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="flex max-w-[400px] flex-col items-center gap-3 rounded-[14px] border border-[#FF5F57]/20 bg-[#FF5F57]/5 p-8 text-center shadow-sm">
          <AlertTriangle className="h-10 w-10 text-[#c53030]" />
          <h3 className="text-[16px] font-bold text-[#c53030]">Data Fetch Failed</h3>
          <p className="text-[13px] text-[#c53030]/80">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1400px]">
      
      {/* ── Header ── */}
      <div className="mb-8">
        <h1 className="text-[24px] font-bold tracking-[-0.03em] text-[#111110]">
          System Overview
        </h1>
        <p className="text-[14px] text-[#929090]">
          Monitor quotation volume, vendor responses, and budget allocation.
        </p>
      </div>

      {/* ── Summary Cards ── */}
      <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-3">
        {/* Total Quotes */}
        <div className="rounded-[14px] border border-black/[0.06] bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <p className="text-[12px] font-semibold uppercase tracking-[0.06em] text-[#929090]">Total Vendor Value</p>
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#5B7FA6]/10">
              <Wallet size={18} className="text-[#5B7FA6]" />
            </div>
          </div>
          <p className="font-mono text-[32px] font-bold text-[#111110]">₹{totalQuotationsValue.toLocaleString('en-IN')}</p>
          <p className="mt-1 text-[12px] font-medium text-[#5B7FA6]">Across {vendorResponses.length} total bids</p>
        </div>

        {/* Approved */}
        <div className="rounded-[14px] border border-[#28CA41]/30 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <p className="text-[12px] font-semibold uppercase tracking-[0.06em] text-[#929090]">Approved Value</p>
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#28CA41]/15">
              <CheckCircle2 size={18} className="text-[#1a8c30]" />
            </div>
          </div>
          <p className="font-mono text-[32px] font-bold text-[#111110]">₹{approvedAmount.toLocaleString('en-IN')}</p>
          <p className="mt-1 text-[12px] font-medium text-[#1a8c30]">{approvedQuotations.length} institutional approvals</p>
        </div>

        {/* Pending */}
        <div className="rounded-[14px] border border-black/[0.06] bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <p className="text-[12px] font-semibold uppercase tracking-[0.06em] text-[#929090]">Pending Value</p>
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#FFBD2E]/15">
              <Clock size={18} className="text-[#9a6e00]" />
            </div>
          </div>
          <p className="font-mono text-[32px] font-bold text-[#111110]">₹{pendingValue.toLocaleString('en-IN')}</p>
          <p className="mt-1 text-[12px] font-medium text-[#9a6e00]">{pendingQuotations.length} pending review</p>
        </div>
      </div>

      {/* ── Charts Row ── */}
      <div className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Bar Chart */}
        <div className="rounded-[14px] border border-black/[0.06] bg-white p-6 shadow-sm">
          <h3 className="mb-6 flex items-center gap-2 text-[16px] font-bold text-[#111110]">
            <FileText size={16} className="text-[#929090]" /> Monthly Approvals
          </h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyTrend} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.04)" vertical={false} />
                <XAxis dataKey="month" stroke="#929090" fontSize={11} tickLine={false} axisLine={false} dy={10} />
                <YAxis stroke="#929090" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(val) => `₹${val / 1000}k`} />
                <Tooltip
                  cursor={{ fill: "rgba(0,0,0,0.02)" }}
                  contentStyle={{ borderRadius: "10px", border: "1px solid rgba(0,0,0,0.08)", boxShadow: "0 4px 12px rgba(0,0,0,0.05)", fontSize: "12px", fontFamily: "monospace" }}
                  formatter={(value) => [`₹${Number(value).toLocaleString('en-IN')}`, "Approved"]}
                />
                <Bar dataKey="expenses" fill="#111110" radius={[4, 4, 0, 0]} barSize={32} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pie Chart */}
        <div className="rounded-[14px] border border-black/[0.06] bg-white p-6 shadow-sm flex flex-col">
          <h3 className="mb-2 text-[16px] font-bold text-[#111110]">Category Distribution</h3>
          <p className="mb-4 text-[12px] text-[#929090]">Breakdown of approved expenditure by department category.</p>
          
          <div className="flex-1 min-h-[220px] relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={expenseByCategory}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={2}
                  dataKey="amount"
                  stroke="none"
                >
                  {expenseByCategory.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ borderRadius: "10px", border: "1px solid rgba(0,0,0,0.08)", boxShadow: "0 4px 12px rgba(0,0,0,0.05)", fontSize: "12px" }}
                  formatter={(value) => `₹${Number(value).toLocaleString('en-IN')}`}
                />
              </PieChart>
            </ResponsiveContainer>
            {/* Center Total Text */}
            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-[10px] font-semibold uppercase tracking-[0.06em] text-[#929090]">Total</span>
              <span className="font-mono text-[16px] font-bold text-[#111110]">
                ₹{expenseByCategory.reduce((sum, cat) => sum + cat.amount, 0).toLocaleString('en-IN')}
              </span>
            </div>
          </div>
          
          {/* Custom Legend */}
          <div className="mt-4 flex flex-wrap justify-center gap-3">
            {expenseByCategory.map((entry, idx) => (
              <div key={idx} className="flex items-center gap-1.5 text-[11px] font-medium text-[#4C433F]">
                <div className="h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: entry.color }} />
                {entry.name} ({entry.percentage}%)
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Transaction History Component */}
      <div className="mb-8">
        <TransactionHistory />
      </div>

      {/* ── Quotation Table ── */}
      <div className="overflow-hidden rounded-[14px] border border-black/[0.06] bg-white shadow-sm">
        <div className="border-b border-black/[0.06] bg-[#FAFAFA] px-6 py-5">
          <h3 className="text-[16px] font-bold text-[#111110]">Recent Quotation Activity</h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-black/[0.04]">
                <th className="whitespace-nowrap px-6 py-4 text-[11px] font-semibold uppercase tracking-[0.06em] text-[#929090]">Quotation ID</th>
                <th className="px-6 py-4 text-[11px] font-semibold uppercase tracking-[0.06em] text-[#929090]">Requirements</th>
                <th className="px-6 py-4 text-[11px] font-semibold uppercase tracking-[0.06em] text-[#929090]">Category</th>
                <th className="whitespace-nowrap px-6 py-4 text-[11px] font-semibold uppercase tracking-[0.06em] text-[#929090]">Bids / Spread</th>
                <th className="whitespace-nowrap px-6 py-4 text-[11px] font-semibold uppercase tracking-[0.06em] text-[#929090]">Status</th>
              </tr>
            </thead>
            <tbody className="text-[13px] text-[#111110]">
              {quotationRequests.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-10 text-center text-[#929090]">
                    No quotation data available.
                  </td>
                </tr>
              ) : (
                quotationRequests
                  .slice(-6)
                  .reverse()
                  .map((quote) => {
                    const responses = vendorResponses.filter((v) => v.quotation_id === quote.quotation_id);
                    const minBid = responses.length ? Math.min(...responses.map((r) => r.amount)) : 0;
                    const maxBid = responses.length ? Math.max(...responses.map((r) => r.amount)) : 0;

                    // Theme Badges
                    let badgeClass = "bg-[#F2F2F2] text-[#929090]";
                    if (quote.status === "Approved") badgeClass = "bg-[#28CA41]/10 text-[#1a8c30]";
                    else if (quote.status === "Under Review") badgeClass = "bg-[#5B7FA6]/10 text-[#5B7FA6]";
                    else if (quote.status === "Pending") badgeClass = "bg-[#FFBD2E]/15 text-[#9a6e00]";
                    else if (quote.status === "Rejected") badgeClass = "bg-[#FF5F57]/10 text-[#c53030]";

                    return (
                      <tr key={quote.quotation_id} className="border-b border-black/[0.04] transition-colors hover:bg-[#FAFAFA]">
                        <td className="whitespace-nowrap px-6 py-4 font-mono font-bold text-[#111110]">
                          REQ-{quote.quotation_id}
                        </td>
                        <td className="px-6 py-4">
                          <p className="line-clamp-2 max-w-[280px] leading-snug">{quote.requirements}</p>
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-[#4C433F]">
                          {quote.product_category}
                        </td>
                        <td className="whitespace-nowrap px-6 py-4">
                          <span className="font-bold">{responses.length}</span> Bids
                          {responses.length > 0 && (
                            <div className="mt-0.5 font-mono text-[11px] text-[#929090]">
                              ₹{minBid.toLocaleString('en-IN')} - ₹{maxBid.toLocaleString('en-IN')}
                            </div>
                          )}
                        </td>
                        <td className="whitespace-nowrap px-6 py-4">
                          <span className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.04em] ${badgeClass}`}>
                            {quote.status}
                          </span>
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
  );
}