"use client";
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
  Line,
  ComposedChart,
  Area,
} from "recharts";

import {
  ExpenseCategory,
  MonthlyTrend,
  PendingQuotation,
  QuotationStatus,
  RecentExpense,
} from "../utility";

const monthlyTrend: MonthlyTrend[] = [
  { month: "Jan", expenses: 45000, quotations: 62000, approved: 58000 },
  { month: "Feb", expenses: 52000, quotations: 71000, approved: 65000 },
  { month: "Mar", expenses: 48000, quotations: 68000, approved: 61000 },
  { month: "Apr", expenses: 58000, quotations: 85000, approved: 75000 },
  { month: "May", expenses: 62000, quotations: 92000, approved: 80000 },
  { month: "Jun", expenses: 55000, quotations: 78000, approved: 70000 },
];

const expenseByCategory: ExpenseCategory[] = [
  {
    category: "Lab Equipment",
    amount: 85000,
    color: "#2563eb",
    percentage: 32,
  },
  {
    category: "Software Licenses",
    amount: 48000,
    color: "#7c3aed",
    percentage: 18,
  },
  {
    category: "Research Materials",
    amount: 38000,
    color: "#0891b2",
    percentage: 14,
  },
  {
    category: "Faculty Development",
    amount: 32000,
    color: "#16a34a",
    percentage: 12,
  },
  {
    category: "Student Projects",
    amount: 28000,
    color: "#ec4899",
    percentage: 11,
  },
  {
    category: "Infrastructure",
    amount: 22000,
    color: "#ea580c",
    percentage: 8,
  },
  { category: "Miscellaneous", amount: 12000, color: "#6b7280", percentage: 5 },
];

const quotationsByStatus: QuotationStatus[] = [
  { status: "Approved", count: 24, value: 185000, color: "#16a34a" },
  { status: "Pending", count: 12, value: 95000, color: "#f59e0b" },
  { status: "Under Review", count: 8, value: 62000, color: "#3b82f6" },
  { status: "Rejected", count: 4, value: 28000, color: "#ef4444" },
];

const recentExpenses: RecentExpense[] = [
  {
    item: "Dell Precision Workstations (15 units)",
    category: "Lab Equipment",
    date: "2024-06-15",
    amount: 42500,
    vendor: "Dell Technologies",
  },
  {
    item: "MATLAB Campus License Renewal",
    category: "Software Licenses",
    date: "2024-06-10",
    amount: 18500,
    vendor: "MathWorks Inc.",
  },
  {
    item: "Research Conference Registration",
    category: "Faculty Development",
    date: "2024-06-05",
    amount: 12800,
    vendor: "IEEE Conference Services",
  },
  {
    item: "Arduino & Raspberry Pi Kits (50 sets)",
    category: "Student Projects",
    date: "2024-05-28",
    amount: 8500,
    vendor: "DigiKey Electronics",
  },
  {
    item: "Network Infrastructure Upgrade",
    category: "Infrastructure",
    date: "2024-05-20",
    amount: 15200,
    vendor: "Cisco Systems",
  },
];

const pendingQuotations: PendingQuotation[] = [
  {
    item: "High-Performance GPU Servers (3 units)",
    vendor: "NVIDIA Enterprise",
    amount: 45000,
    requestDate: "2024-06-18",
    status: "Under Review",
  },
  {
    item: "Cloud Computing Credits - AWS Educate",
    vendor: "Amazon Web Services",
    amount: 28000,
    requestDate: "2024-06-12",
    status: "Pending Approval",
  },
  {
    item: "Professional Development Workshop Series",
    vendor: "Tech Training Institute",
    amount: 15500,
    requestDate: "2024-06-08",
    status: "Under Review",
  },
];

const Dashboard = () => {
  const totalExpenses = expenseByCategory.reduce(
    (sum, item) => sum + item.amount,
    0
  );
  const totalQuotations = quotationsByStatus.reduce(
    (sum, item) => sum + item.value,
    0
  );
  const approvedQuotations =
    quotationsByStatus.find((q) => q.status === "Approved")?.value || 0;
  const pendingValue = pendingQuotations.reduce(
    (sum, item) => sum + item.amount,
    0
  );

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="max-w-7xl mx-auto space-y-6">
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
            <p className="text-sm font-medium text-gray-600">Total Expenses</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">
              ${totalExpenses.toLocaleString()}
            </p>
            <p className="text-xs text-green-600 mt-2 flex items-center">
              <svg
                className="w-4 h-4 mr-1"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z"
                  clipRule="evenodd"
                />
              </svg>
              Within budget by 8%
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
            <p className="text-sm font-medium text-gray-600">
              Total Quotations
            </p>
            <p className="text-2xl font-bold text-gray-900 mt-1">
              ${totalQuotations.toLocaleString()}
            </p>
            <p className="text-xs text-blue-600 mt-2">
              48 quotations submitted
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
            <p className="text-sm font-medium text-gray-600">Approved Amount</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">
              ${approvedQuotations.toLocaleString()}
            </p>
            <p className="text-xs text-green-600 mt-2">50% approval rate</p>
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
              ${pendingValue.toLocaleString()}
            </p>
            <p className="text-xs text-orange-600 mt-2">
              {pendingQuotations.length} items awaiting
            </p>
          </div>
        </div>

        {/* Main Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Monthly Trend Chart */}
          <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Monthly Expenses vs Quotations Trend
            </h3>
            <ResponsiveContainer width="100%" height={320}>
              <ComposedChart data={monthlyTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" stroke="#6b7280" fontSize={12} />
                <YAxis
                  stroke="#6b7280"
                  fontSize={12}
                  tickFormatter={(value) => `$${value / 1000}k`}
                />
                <Tooltip
                  formatter={(value) => `$${value?.toLocaleString()}`}
                  contentStyle={{
                    borderRadius: "8px",
                    border: "1px solid #e5e7eb",
                  }}
                />
                <Legend />
                <Area
                  type="monotone"
                  dataKey="quotations"
                  fill="#93c5fd"
                  stroke="#3b82f6"
                  fillOpacity={0.3}
                  name="Quotations"
                />
                <Bar
                  dataKey="expenses"
                  fill="#2563eb"
                  name="Expenses"
                  radius={[4, 4, 0, 0]}
                />
                <Line
                  type="monotone"
                  dataKey="approved"
                  stroke="#16a34a"
                  strokeWidth={2}
                  name="Approved"
                  dot={{ fill: "#16a34a", r: 4 }}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>

          {/* Expense Breakdown Pie Chart */}
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
                  fill="#8884d8"
                  dataKey="amount"
                >
                  {expenseByCategory.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `$${value.toLocaleString()}`} />
              </PieChart>
            </ResponsiveContainer>
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-600">
                  Total Department Expenses
                </span>
                <span className="text-xl font-bold text-gray-900">
                  ${totalExpenses.toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Quotation Status and Recent Expenses */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Quotation Status */}
          <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Quotation Status Overview
            </h3>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={quotationsByStatus} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis
                  type="number"
                  stroke="#6b7280"
                  fontSize={12}
                  tickFormatter={(value) => `$${value / 1000}k`}
                />
                <YAxis
                  type="category"
                  dataKey="status"
                  stroke="#6b7280"
                  fontSize={12}
                  width={100}
                />
                <Tooltip
                  formatter={(value, name) => [
                    name === "value" ? `$${value?.toLocaleString()}` : value,
                    name === "value" ? "Amount" : "Count",
                  ]}
                  contentStyle={{
                    borderRadius: "8px",
                    border: "1px solid #e5e7eb",
                  }}
                />
                <Legend />
                <Bar
                  dataKey="value"
                  fill="#3b82f6"
                  name="Amount"
                  radius={[0, 4, 4, 0]}
                >
                  {quotationsByStatus.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
                <Bar
                  dataKey="count"
                  fill="#9ca3af"
                  name="Count"
                  radius={[0, 4, 4, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Recent Major Expenses */}
          <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Recent Transactions
            </h3>
            <div className="space-y-4 max-h-80 overflow-y-auto">
              {recentExpenses.map((expense, index) => (
                <div
                  key={index}
                  className="border-l-4 pl-4 py-2 hover:bg-gray-50 transition-colors"
                  style={{
                    borderColor: expenseByCategory.find(
                      (c) => c.category === expense.category
                    )?.color,
                  }}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-gray-900">
                        {expense.item}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {expense.vendor}
                      </p>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                          {expense.category}
                        </span>
                        <span className="text-xs text-gray-500">
                          {expense.date}
                        </span>
                      </div>
                    </div>
                    <p className="text-sm font-bold text-gray-900 ml-4">
                      ${expense.amount.toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Pending Quotations Table */}
        <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Pending Quotations Awaiting Approval
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                    Item Description
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                    Vendor
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                    Amount
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                    Request Date
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {pendingQuotations.map((quote, index) => (
                  <tr
                    key={index}
                    className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                  >
                    <td className="py-3 px-4 text-sm text-gray-900">
                      {quote.item}
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-600">
                      {quote.vendor}
                    </td>
                    <td className="py-3 px-4 text-sm font-semibold text-gray-900">
                      ${quote.amount.toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-600">
                      {quote.requestDate}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`text-xs px-3 py-1 rounded-full font-medium ${
                          quote.status === "Under Review"
                            ? "bg-blue-100 text-blue-700"
                            : "bg-orange-100 text-orange-700"
                        }`}
                      >
                        {quote.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
