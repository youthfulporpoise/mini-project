"use client";

import { useEffect, useMemo, useState } from "react";
import clsx from "clsx";
import { Transaction } from "../utility/index";
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
  Legend,
} from "recharts";

const transactions: Transaction[] = [
  {
    transaction_id: "TXN-2024-001",
    quotation_id: "Q2024-001",
    payment_status: "Paid",
    amount: 42500,
    transaction_date: "2024-01-25",
    vendor_name: "Dell Technologies",
  },
  {
    transaction_id: "TXN-2024-002",
    quotation_id: "Q2024-002",
    payment_status: "Paid",
    amount: 18500,
    transaction_date: "2024-01-30",
    vendor_name: "MathWorks Inc.",
  },
  {
    transaction_id: "TXN-2024-003",
    quotation_id: "Q2024-003",
    payment_status: "Paid",
    amount: 12800,
    transaction_date: "2024-02-15",
    vendor_name: "IEEE Conference Services",
  },
  {
    transaction_id: "TXN-2024-004",
    quotation_id: "Q2024-004",
    payment_status: "Paid",
    amount: 22000,
    transaction_date: "2024-02-28",
    vendor_name: "Cisco Systems",
  },
  {
    transaction_id: "TXN-2024-005",
    quotation_id: "Q2024-005",
    payment_status: "Paid",
    amount: 8500,
    transaction_date: "2024-03-18",
    vendor_name: "DigiKey Electronics",
  },
];

type BackendQuotation = {
  id: number;
  title: string;
  department: string;
  description: string;
  category: string;
  submission_deadline: string;
  status: number;
  delivery_period: string;
  qt_req_verified_accountant: boolean;
  final_qt_verified_accountant: boolean;
  qt_verified_principal: boolean;
  items: {
    id: number;
    name: string;
    description: string;
    amount: number;
  }[];
};

type BackendQuotationResponse = {
  id: number;
  quotation: number;
  vendor: number;
  response_items: {
    id: number;
    item: number;
    brand_model: string;
    delivery_period: string;
    unit_price: number;
    description: string;
  }[];
};

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

const CATEGORY_COLORS = [
  "#3b82f6",
  "#8b5cf6",
  "#16a34a",
  "#f59e0b",
  "#ef4444",
  "#06b6d4",
  "#84cc16",
  "#ec4899",
];

const mapQuotationStatus = (
  status: number,
): QuotationRequestRow["status"] => STATUS_LABELS[status] ?? "Pending";

const getRepresentativeQuotationValue = (
  quotationId: number,
  vendorResponses: VendorResponseRow[],
) => {
  const responses = vendorResponses.filter((v) => v.quotation_id === quotationId);
  if (responses.length === 0) return 0;
  return Math.min(...responses.map((r) => r.amount));
};

const Dashboard = () => {
  const [quotationRequests, setQuotationRequests] = useState<QuotationRequestRow[]>([]);
  const [vendorResponses, setVendorResponses] = useState<VendorResponseRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const BASE_URL = "http://127.0.0.1:8000";

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);

        const [quotationRes, responseRes] = await Promise.all([
          fetch(`${BASE_URL}/qt/`),
          fetch(`${BASE_URL}/responses/`),
        ]);

        if (!quotationRes.ok) {
          throw new Error(`Failed to fetch quotations: ${quotationRes.status}`);
        }

        if (!responseRes.ok) {
          throw new Error(`Failed to fetch vendor responses: ${responseRes.status}`);
        }

        const quotationsData: BackendQuotation[] = await quotationRes.json();
        const responsesData: BackendQuotationResponse[] = await responseRes.json();

        const mappedQuotations: QuotationRequestRow[] = quotationsData.map((quotation) => ({
          quotation_id: quotation.id,
          requirements: quotation.description,
          product_category: quotation.category,
          status: mapQuotationStatus(quotation.status),
          created_date: quotation.submission_deadline,
        }));

        const mappedResponses: VendorResponseRow[] = responsesData.flatMap((response) =>
          response.response_items.map((item) => ({
            quotation_id: response.quotation,
            amount: item.unit_price,
          })),
        );

        setQuotationRequests(mappedQuotations);
        setVendorResponses(mappedResponses);
      } catch (err) {
        console.error("Dashboard fetch error:", err);
        setError(err instanceof Error ? err.message : "Something went wrong");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const totalExpenses = useMemo(() => {
    return transactions
      .filter((t) => t.payment_status === "Paid")
      .reduce((sum, t) => sum + t.amount, 0);
  }, []);

  const totalQuotations = useMemo(() => {
    return vendorResponses.reduce((sum, response) => sum + response.amount, 0);
  }, [vendorResponses]);

  const quotationsByStatus = useMemo(() => {
    const counts: Record<QuotationRequestRow["status"], number> = {
      Pending: 0,
      "Under Review": 0,
      Approved: 0,
      Rejected: 0,
    };

    quotationRequests.forEach((q) => {
      counts[q.status] += 1;
    });

    return Object.entries(counts).map(([status, count]) => ({
      status: status as QuotationRequestRow["status"],
      count,
    }));
  }, [quotationRequests]);

  const approvedAmount = useMemo(() => {
    return quotationRequests
      .filter((q) => q.status === "Approved")
      .reduce(
        (sum, q) => sum + getRepresentativeQuotationValue(q.quotation_id, vendorResponses),
        0,
      );
  }, [quotationRequests, vendorResponses]);

  const pendingQuotations = useMemo(() => {
    return quotationRequests.filter(
      (q) => q.status === "Pending" || q.status === "Under Review",
    );
  }, [quotationRequests]);

  const pendingValue = useMemo(() => {
    return pendingQuotations.reduce(
      (sum, q) => sum + getRepresentativeQuotationValue(q.quotation_id, vendorResponses),
      0,
    );
  }, [pendingQuotations, vendorResponses]);

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

    quotationRequests
      .filter((q) => q.status === "Approved")
      .forEach((q) => {
        const date = new Date(q.created_date);
        const month = monthNames[date.getMonth()];
        const value = getRepresentativeQuotationValue(q.quotation_id, vendorResponses);

        monthlyMap.set(month, (monthlyMap.get(month) || 0) + value);
      });

    return monthNames.map((month) => ({
      month,
      expenses: monthlyMap.get(month) || 0,
    }));
  }, [quotationRequests, vendorResponses]);

  const expenseByCategory = useMemo(() => {
    const categoryMap = new Map<string, number>();

    quotationRequests
      .filter((q) => q.status === "Approved")
      .forEach((q) => {
        const value = getRepresentativeQuotationValue(q.quotation_id, vendorResponses);
        categoryMap.set(
          q.product_category,
          (categoryMap.get(q.product_category) || 0) + value,
        );
      });

    const total = Array.from(categoryMap.values()).reduce((sum, val) => sum + val, 0);

    return Array.from(categoryMap.entries()).map(([category, amount], index) => ({
      category,
      amount,
      percentage: total > 0 ? ((amount / total) * 100).toFixed(1) : "0.0",
      color: CATEGORY_COLORS[index % CATEGORY_COLORS.length],
    }));
  }, [quotationRequests, vendorResponses]);

  const recentTransactions = useMemo(() => {
    return [...transactions]
      .sort(
        (a, b) =>
          new Date(b.transaction_date).getTime() - new Date(a.transaction_date).getTime(),
      )
      .slice(0, 5);
  }, []);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6 text-center text-gray-600">
          Loading dashboard data...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="bg-red-50 rounded-xl shadow-md border border-red-200 p-6 text-center text-red-700">
          Error loading dashboard: {error}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6 p-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-blue-100 rounded-lg p-3">
              <svg
                className="w-6 h-6 text-blue-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
            </div>
          </div>
          <p className="text-sm font-medium text-gray-600">Total Paid Expenses</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">
            ₹{totalExpenses.toLocaleString()}
          </p>
          <p className="text-xs text-green-600 mt-2 flex items-center">
            <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z"
                clipRule="evenodd"
              />
            </svg>
            {transactions.filter((t) => t.payment_status === "Paid").length} transactions
            completed
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-purple-100 rounded-lg p-3">
              <svg
                className="w-6 h-6 text-purple-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
          </div>
          <p className="text-sm font-medium text-gray-600">Total Vendor Responses</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">
            ₹{totalQuotations.toLocaleString()}
          </p>
          <p className="text-xs text-blue-600 mt-2">
            {vendorResponses.length} responses received
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-green-100 rounded-lg p-3">
              <svg
                className="w-6 h-6 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
          </div>
          <p className="text-sm font-medium text-gray-600">Approved Quotations</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">
            ₹{approvedAmount.toLocaleString()}
          </p>
          <p className="text-xs text-green-600 mt-2">
            {quotationsByStatus.find((q) => q.status === "Approved")?.count || 0}{" "}
            quotations approved
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-orange-100 rounded-lg p-3">
              <svg
                className="w-6 h-6 text-orange-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
          </div>
          <p className="text-sm font-medium text-gray-600">Pending Review</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">
            ₹{pendingValue.toLocaleString()}
          </p>
          <p className="text-xs text-orange-600 mt-2">
            {pendingQuotations.length} quotations awaiting
          </p>
        </div>
      </div>

      {/* Main Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Monthly Approved Quotations
          </h3>
          <ResponsiveContainer width="100%" height={320}>
            <BarChart data={monthlyTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" stroke="#6b7280" fontSize={12} />
              <YAxis
                stroke="#6b7280"
                fontSize={12}
                tickFormatter={(value) => `₹${value / 1000}k`}
              />
              <Tooltip
                formatter={(value) => `₹${Number(value).toLocaleString()}`}
                contentStyle={{
                  borderRadius: "8px",
                  border: "1px solid #e5e7eb",
                }}
              />
              <Legend />
              <Bar
                dataKey="expenses"
                fill="#16a34a"
                name="Approved Amount"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Expense Breakdown by Category
          </h3>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                data={expenseByCategory}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ category, percentage }) =>
                  `${category.split(" ")[0]}: ${percentage}%`
                }
                outerRadius={100}
                dataKey="amount"
              >
                {expenseByCategory.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => `₹${Number(value).toLocaleString()}`} />
            </PieChart>
          </ResponsiveContainer>

          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-600">Total Expenses</span>
              <span className="text-xl font-bold text-gray-900">
                ₹
                {expenseByCategory
                  .reduce((sum, cat) => sum + cat.amount, 0)
                  .toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="grid grid-cols-1 gap-6">
        <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Recent Transactions
          </h3>
          <div className="space-y-4 max-h-80 overflow-y-auto">
            {recentTransactions.map((transaction, index) => {
              const statusColors: Record<string, string> = {
                Paid: "bg-green-100 text-green-700",
                Pending: "bg-orange-100 text-orange-700",
                Processing: "bg-blue-100 text-blue-700",
                Failed: "bg-red-100 text-red-700",
              };

              return (
                <div
                  key={index}
                  className={clsx(
                    "border-l-4 pl-4 py-2 hover:bg-gray-50 transition-colors",
                    transaction.payment_status === "Paid"
                      ? "border-green-600"
                      : "border-orange-500",
                  )}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-gray-900">
                        {transaction.transaction_id}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {transaction.vendor_name}
                      </p>
                      <div className="flex items-center gap-3 mt-1">
                        <span
                          className={clsx(
                            "text-xs px-2 py-1 rounded font-medium",
                            statusColors[transaction.payment_status] ||
                              "bg-gray-100 text-gray-700",
                          )}
                        >
                          {transaction.payment_status}
                        </span>
                        <span className="text-xs text-gray-500">
                          {transaction.transaction_date}
                        </span>
                      </div>
                    </div>
                    <p className="text-sm font-bold text-gray-900 ml-4">
                      ₹{transaction.amount.toLocaleString()}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Quotation Requests Table */}
      <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Quotation Requests & Vendor Responses
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                  Quotation ID
                </th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                  Requirements
                </th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                  Category
                </th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                  Vendor Responses
                </th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                  Status
                </th>
              </tr>
            </thead>
            <tbody>
              {quotationRequests.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="py-6 px-4 text-sm text-center text-gray-500"
                  >
                    No quotation data found.
                  </td>
                </tr>
              ) : (
                quotationRequests
                  .slice(-5)
                  .reverse()
                  .map((quote) => {
                    const responses = vendorResponses.filter(
                      (v) => v.quotation_id === quote.quotation_id,
                    );

                    return (
                      <tr
                        key={quote.quotation_id}
                        className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                      >
                        <td className="py-3 px-4 text-sm font-semibold text-gray-900">
                          {quote.quotation_id}
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-600 max-w-xs truncate">
                          {quote.requirements}
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-600">
                          {quote.product_category}
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-900">
                          {responses.length} vendor{responses.length !== 1 ? "s" : ""}
                          {responses.length > 0 && (
                            <span className="text-xs text-gray-500 ml-1">
                              (₹
                              {Math.min(
                                ...responses.map((r) => r.amount),
                              ).toLocaleString()}{" "}
                              - ₹
                              {Math.max(
                                ...responses.map((r) => r.amount),
                              ).toLocaleString()}
                              )
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={clsx(
                              "text-xs px-3 py-1 rounded-full font-medium",
                              quote.status === "Approved" &&
                                "bg-green-100 text-green-700",
                              quote.status === "Under Review" &&
                                "bg-blue-100 text-blue-700",
                              quote.status === "Pending" &&
                                "bg-orange-100 text-orange-700",
                              quote.status === "Rejected" &&
                                "bg-red-100 text-red-700",
                            )}
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
  );
};

export default Dashboard;