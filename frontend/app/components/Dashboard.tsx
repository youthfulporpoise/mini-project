"use client";

import { useMemo } from "react";
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
import {
  CheckCircle2,
  Clock,
  FileText,
  CreditCard,
  ArrowUpRight,
  PackageCheck,
} from "lucide-react";
import {
  QuotationRequestRow,
  VendorResponseRow,
  RazorpayTransaction,
} from "../utility/index";
import { ExportTransactionsPDFButton } from "./JsonToPdfGen";

const CATEGORY_COLORS = [
  "#111110", // Dark Ink
  "#5B7FA6", // Muted Blue
  "#FB4D27", // Accent Orange
  "#28CA41", // Success Green
  "#FFBD2E", // Warning Yellow
  "#8C8C8C", // Neutral Gray
];

const getRepresentativeQuotationValue = (
  quotationId: string,
  vendorResponses: VendorResponseRow[],
) => {
  const responses = vendorResponses.filter(
    (v) => String(v.quotation_id) === String(quotationId),
  );
  if (responses.length === 0) return 0;
  return Math.min(...responses.map((r) => r.amount));
};

export default function Dashboard({
  quotationRequests,
  vendorResponses,
  transactions,
}: {
  quotationRequests: QuotationRequestRow[];
  vendorResponses: VendorResponseRow[];
  transactions: RazorpayTransaction[];
}) {
  // ── Financial Metrics ──

  const totalSettledPayments = useMemo(() => {
    return transactions
      .filter((t) => t.status === "captured")
      .reduce((sum, t) => sum + t.amount / 100, 0);
  }, [transactions]);

  const successfulQuotations = useMemo(
    () => quotationRequests.filter((q) => q.status === "SUCCESS"),
    [quotationRequests],
  );
  const approvedQuotations = useMemo(
    () => quotationRequests.filter((q) => q.status === "APPROVED"),
    [quotationRequests],
  );
  const pendingQuotations = useMemo(
    () => quotationRequests.filter((q) => q.status === "PENDING"),
    [quotationRequests],
  );
  const deliveredQuotations = useMemo(
    () => quotationRequests.filter((q) => q.status === "DELIVERED"),
    [quotationRequests],
  );

  const paidAmount = useMemo(() => {
    return successfulQuotations.reduce(
      (sum, q) => sum + getRepresentativeQuotationValue(q.id, vendorResponses),
      0,
    );
  }, [successfulQuotations, vendorResponses]);
  const approvedAmount = useMemo(() => {
    return approvedQuotations.reduce(
      (sum, q) => sum + getRepresentativeQuotationValue(q.id, vendorResponses),
      0,
    );
  }, [approvedQuotations, vendorResponses]);

  const pendingAmount = useMemo(() => {
    return pendingQuotations.reduce(
      (sum, q) => sum + getRepresentativeQuotationValue(q.id, vendorResponses),
      0,
    );
  }, [pendingQuotations, vendorResponses]);

  const deliveredAmount = useMemo(() => {
    return deliveredQuotations.reduce(
      (sum, q) => sum + getRepresentativeQuotationValue(q.id, vendorResponses),
      0,
    );
  }, [deliveredQuotations, vendorResponses]);

  // ── Charts Data ──
  const monthlyTrend = useMemo(() => {
    const monthNames = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];
    const monthlyMap = new Map<string, number>();
    console.log(successfulQuotations);
    [
      ...approvedQuotations,
      ...deliveredQuotations,
      ...successfulQuotations,
    ].forEach((q) => {
      const date = new Date(q.submissionDeadline);
      console.log(q);
      if (!isNaN(date.getTime())) {
        const month = monthNames[date.getMonth()];
        const value = getRepresentativeQuotationValue(q.id, vendorResponses);
        monthlyMap.set(month, (monthlyMap.get(month) || 0) + value);
      }
    });

    return monthNames.map((month) => ({
      month,
      expenses: monthlyMap.get(month) || 0,
    }));
  }, [
    approvedQuotations,
    deliveredQuotations,
    vendorResponses,
    successfulQuotations,
  ]);

  const expenseByCategory = useMemo(() => {
    const categoryMap = new Map<string, number>();
    [...approvedQuotations, ...deliveredQuotations].forEach((q) => {
      const value = getRepresentativeQuotationValue(q.id, vendorResponses);
      const catName = q.category || "Uncategorized";
      categoryMap.set(catName, (categoryMap.get(catName) || 0) + value);
    });

    const total = Array.from(categoryMap.values()).reduce(
      (sum, val) => sum + val,
      0,
    );

    return Array.from(categoryMap.entries()).map(
      ([category, amount], index) => ({
        name: category,
        amount,
        percentage: total > 0 ? ((amount / total) * 100).toFixed(1) : "0.0",
        color: CATEGORY_COLORS[index % CATEGORY_COLORS.length],
      }),
    );
  }, [approvedQuotations, deliveredQuotations, vendorResponses]);

  return (
    <div className="mx-auto max-w-[1400px]">
      {/* ── Header ── */}
      <div className="flex flex-row justify-between">
        <div className="mb-8">
          <h1 className="text-[24px] font-bold tracking-[-0.03em] text-[#111110]">
            System Overview
          </h1>
          <p className="text-[14px] text-[#929090]">
            Live tracking of institutional procurement, vendor activity, and
            settled payments.
          </p>
        </div>
        <div>
          <ExportTransactionsPDFButton transactions={transactions} />
        </div>
      </div>

      {/* Download Transactions*/}
      <div className="flex flex-row w-full justify-end"></div>

      {/* ── Summary Cards ── */}
      <div className="mb-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {/* Settled Payments */}
        <div className="rounded-[14px] border border-[#28CA41]/30 bg-[#28CA41]/5 p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <p className="text-[12px] font-semibold uppercase tracking-[0.06em] text-[#1a8c30]">
              Settled via Gateway
            </p>
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#28CA41]/15">
              <CreditCard size={18} className="text-[#1a8c30]" />
            </div>
          </div>
          <p className="font-mono text-[32px] font-bold text-[#111110]">
            ₹{totalSettledPayments.toLocaleString("en-IN")}
          </p>
          <p className="mt-1 text-[12px] font-medium text-[#1a8c30]">
            {transactions.filter((t) => t.status === "captured").length}{" "}
            successful payments
          </p>
        </div>

        {/* Delivered / Unpaid */}
        <div className="rounded-[14px] border border-black/[0.06] bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <p className="text-[12px] font-semibold uppercase tracking-[0.06em] text-[#929090]">
              Delivered / Unpaid
            </p>
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#5B7FA6]/10">
              <PackageCheck size={18} className="text-[#5B7FA6]" />
            </div>
          </div>
          <p className="font-mono text-[32px] font-bold text-[#111110]">
            ₹{deliveredAmount.toLocaleString("en-IN")}
          </p>
          <p className="mt-1 text-[12px] font-medium text-[#5B7FA6]">
            {deliveredQuotations.length} orders awaiting settlement
          </p>
        </div>

        {/* Approved */}
        <div className="rounded-[14px] border border-black/[0.06] bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <p className="text-[12px] font-semibold uppercase tracking-[0.06em] text-[#929090]">
              Approved Quotations
            </p>
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-black/5">
              <CheckCircle2 size={18} className="text-[#111110]" />
            </div>
          </div>
          <p className="font-mono text-[32px] font-bold text-[#111110]">
            ₹{paidAmount.toLocaleString("en-IN")}
          </p>
          <p className="mt-1 text-[12px] font-medium text-[#929090]">
            {successfulQuotations.length } institutional approvals
          </p>
        </div>

        {/* Pending */}
        <div className="rounded-[14px] border border-black/[0.06] bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <p className="text-[12px] font-semibold uppercase tracking-[0.06em] text-[#929090]">
              Pending Review
            </p>
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#FFBD2E]/15">
              <Clock size={18} className="text-[#9a6e00]" />
            </div>
          </div>
          <p className="font-mono text-[32px] font-bold text-[#111110]">
            ₹{pendingAmount.toLocaleString("en-IN")}
          </p>
          <p className="mt-1 text-[12px] font-medium text-[#9a6e00]">
            {pendingQuotations.length} active requests
          </p>
        </div>
      </div>

      {/* ── Main Layout: Charts & Transactions ── */}
      <div className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Left Column: Charts (Span 8) */}
        <div className="flex flex-col gap-6 lg:col-span-8">
          {/* Bar Chart */}
          <div className="rounded-[14px] border border-black/[0.06] bg-white p-6 shadow-sm">
            <h3 className="mb-6 flex items-center gap-2 text-[16px] font-bold text-[#111110]">
              <FileText size={16} className="text-[#929090]" /> Monthly Spending
              Trend
            </h3>
            <div className="h-[280px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={monthlyTrend}
                  margin={{ top: 0, right: 0, left: -20, bottom: 0 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="rgba(0,0,0,0.04)"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="month"
                    stroke="#929090"
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                    dy={10}
                  />
                  <YAxis
                    stroke="#929090"
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(val) => `₹${val / 1000}k`}
                  />
                  <Tooltip
                    cursor={{ fill: "rgba(0,0,0,0.02)" }}
                    contentStyle={{
                      borderRadius: "10px",
                      border: "1px solid rgba(0,0,0,0.08)",
                      boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
                      fontSize: "12px",
                      fontFamily: "monospace",
                    }}
                    formatter={(value) => [
                      `₹${Number(value).toLocaleString("en-IN")}`,
                      "Total",
                    ]}
                  />
                  <Bar
                    dataKey="expenses"
                    fill="#111110"
                    radius={[4, 4, 0, 0]}
                    barSize={32}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Quotation Table */}
          <div className="overflow-hidden rounded-[14px] border border-black/[0.06] bg-white shadow-sm">
            <div className="border-b border-black/[0.06] bg-[#FAFAFA] px-6 py-5">
              <h3 className="text-[16px] font-bold text-[#111110]">
                Recent Procurements
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-black/[0.04]">
                    <th className="whitespace-nowrap px-6 py-4 text-[11px] font-semibold uppercase tracking-[0.06em] text-[#929090]">
                      Req ID
                    </th>
                    <th className="px-6 py-4 text-[11px] font-semibold uppercase tracking-[0.06em] text-[#929090]">
                      Requirements
                    </th>
                    <th className="px-6 py-4 text-[11px] font-semibold uppercase tracking-[0.06em] text-[#929090]">
                      Category
                    </th>
                    <th className="whitespace-nowrap px-6 py-4 text-[11px] font-semibold uppercase tracking-[0.06em] text-[#929090]">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="text-[13px] text-[#111110]">
                  {quotationRequests.length === 0 ? (
                    <tr>
                      <td
                        colSpan={4}
                        className="py-10 text-center text-[#929090]"
                      >
                        No quotation data available.
                      </td>
                    </tr>
                  ) : (
                    quotationRequests
                      .slice(-5)
                      .reverse()
                      .map((quote) => {
                        let badgeClass = "bg-[#F2F2F2] text-[#929090]";
                        if (quote.status === "APPROVED")
                          badgeClass = "bg-[#28CA41]/10 text-[#1a8c30]";
                        else if (quote.status === "PENDING")
                          badgeClass = "bg-[#FFBD2E]/15 text-[#9a6e00]";
                        else if (quote.status === "REJECTED")
                          badgeClass = "bg-[#FF5F57]/10 text-[#c53030]";
                        else if (quote.status === "DELIVERED")
                          badgeClass = "bg-[#5B7FA6]/10 text-[#5B7FA6]";

                        return (
                          <tr
                            key={quote.id}
                            className="border-b border-black/[0.04] transition-colors hover:bg-[#FAFAFA]"
                          >
                            <td className="whitespace-nowrap px-6 py-4 font-mono font-bold text-[#111110]">
                              REQ-{quote.id}
                            </td>
                            <td className="px-6 py-4">
                              <p className="line-clamp-1">
                                {quote.quotationTitle}
                              </p>
                            </td>
                            <td className="whitespace-nowrap px-6 py-4 text-[#4C433F]">
                              {quote.category}
                            </td>
                            <td className="whitespace-nowrap px-6 py-4">
                              <span
                                className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.04em] ${badgeClass}`}
                              >
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

        {/* Right Column: Pie Chart & Transactions (Span 4) */}
        <div className="flex flex-col gap-6 lg:col-span-4">
          {/* Pie Chart */}
          <div className="rounded-[14px] border border-black/[0.06] bg-white p-6 shadow-sm flex flex-col">
            <h3 className="mb-2 text-[16px] font-bold text-[#111110]">
              Category Breakdown
            </h3>
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
                    contentStyle={{
                      borderRadius: "10px",
                      border: "1px solid rgba(0,0,0,0.08)",
                      boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
                      fontSize: "12px",
                    }}
                    formatter={(value) =>
                      `₹${Number(value).toLocaleString("en-IN")}`
                    }
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-[10px] font-semibold uppercase tracking-[0.06em] text-[#929090]">
                  Total
                </span>
                <span className="font-mono text-[14px] font-bold text-[#111110]">
                  ₹
                  {expenseByCategory
                    .reduce((sum, cat) => sum + cat.amount, 0)
                    .toLocaleString("en-IN")}
                </span>
              </div>
            </div>
          </div>

          {/* Recent Razorpay Transactions */}
          <div className="flex flex-1 flex-col overflow-hidden rounded-[14px] border border-black/[0.06] bg-white shadow-sm">
            <div className="border-b border-black/[0.06] bg-[#FAFAFA] p-5">
              <h3 className="text-[16px] font-bold text-[#111110]">
                Recent Gateway Payments
              </h3>
            </div>
            <div className="flex-1 overflow-y-auto p-2">
              {transactions.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center p-6 text-center text-[#929090]">
                  <CreditCard size={24} className="mb-2 opacity-20" />
                  <p className="text-[13px]">No recent transactions.</p>
                </div>
              ) : (
                <div className="flex flex-col gap-1">
                  {transactions.slice(0, 6).map((txn) => {
                    const amountInInr = txn.amount / 100; // Convert Paise to INR
                    const isSuccess = txn.status === "captured";
                    const formattedDate = new Date(
                      txn.created_at * 1000,
                    ).toLocaleDateString(undefined, {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    });

                    return (
                      <div
                        key={txn.id}
                        className="group flex items-center justify-between rounded-[10px] p-3 transition-colors hover:bg-[#FAFAFA]"
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`flex h-8 w-8 items-center justify-center rounded-md ${isSuccess ? "bg-[#28CA41]/10" : "bg-[#FF5F57]/10"}`}
                          >
                            <ArrowUpRight
                              size={14}
                              className={
                                isSuccess ? "text-[#1a8c30]" : "text-[#c53030]"
                              }
                            />
                          </div>
                          <div>
                            <p className="font-mono text-[11px] font-bold text-[#111110]">
                              {txn.id.slice(0, 14)}...
                            </p>
                            <p className="text-[10px] text-[#929090] uppercase">
                              {formattedDate} · {txn.method}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-mono text-[13px] font-bold text-[#111110]">
                            ₹{amountInInr.toLocaleString("en-IN")}
                          </p>
                          <p
                            className={`text-[10px] font-bold uppercase tracking-[0.06em] ${isSuccess ? "text-[#1a8c30]" : "text-[#c53030]"}`}
                          >
                            {txn.status}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
