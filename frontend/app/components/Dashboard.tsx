"use client";
import { QuotationRequest, Transaction, VendorResponse } from "../utility";
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



// Sample Data
const   quotationRequests: QuotationRequest[] = [
  {
    client_id: "DEPT-CS-001",
    quotation_id: "Q2024-001",
    requirements:
      "Dell Precision Workstations - 15 units with minimum 32GB RAM, Intel i7 processor",
    status: "Approved",
    product_category: "Lab Equipment",
    created_date: "2024-01-15",
    approved_amount: 42500,
  },
  {
    client_id: "DEPT-CS-002",
    quotation_id: "Q2024-002",
    requirements: "MATLAB Campus License Renewal for 500 users",
    status: "Approved",
    product_category: "Software Licenses",
    created_date: "2024-01-20",
    approved_amount: 18500,
  },
  {
    client_id: "DEPT-CS-003",
    quotation_id: "Q2024-003",
    requirements: "Research Conference Registration - IEEE 2024",
    status: "Approved",
    product_category: "Faculty Development",
    created_date: "2024-02-05",
    approved_amount: 12800,
  },
  {
    client_id: "DEPT-CS-004",
    quotation_id: "Q2024-004",
    requirements: "Network Switches and Routers Upgrade",
    status: "Approved",
    product_category: "Infrastructure",
    created_date: "2024-02-18",
    approved_amount: 22000,
  },
  {
    client_id: "DEPT-CS-005",
    quotation_id: "Q2024-005",
    requirements: "Arduino & Raspberry Pi Kits - 50 sets for student projects",
    status: "Approved",
    product_category: "Student Projects",
    created_date: "2024-03-10",
    approved_amount: 8500,
  },
  {
    client_id: "DEPT-CS-006",
    quotation_id: "Q2024-006",
    requirements: "Chemical reagents and lab consumables",
    status: "Approved",
    product_category: "Research Materials",
    created_date: "2024-03-25",
    approved_amount: 15200,
  },
  {
    client_id: "DEPT-CS-007",
    quotation_id: "Q2024-007",
    requirements: "AutoCAD and SolidWorks licenses - 30 users",
    status: "Approved",
    product_category: "Software Licenses",
    created_date: "2024-04-08",
    approved_amount: 28000,
  },
  {
    client_id: "DEPT-CS-008",
    quotation_id: "Q2024-008",
    requirements: "3D Printers for prototyping lab - 5 units",
    status: "Approved",
    product_category: "Lab Equipment",
    created_date: "2024-04-22",
    approved_amount: 45000,
  },
  {
    client_id: "DEPT-CS-009",
    quotation_id: "Q2024-009",
    requirements: "Professional development workshop series",
    status: "Approved",
    product_category: "Faculty Development",
    created_date: "2024-05-12",
    approved_amount: 19200,
  },
  {
    client_id: "DEPT-CS-010",
    quotation_id: "Q2024-010",
    requirements: "Microscopes and lab equipment upgrade",
    status: "Approved",
    product_category: "Research Materials",
    created_date: "2024-05-28",
    approved_amount: 22800,
  },
  {
    client_id: "DEPT-CS-011",
    quotation_id: "Q2024-011",
    requirements: "High-Performance GPU Servers - 3 units with NVIDIA A100",
    status: "Under Review",
    product_category: "Lab Equipment",
    created_date: "2024-06-18",
  },
  {
    client_id: "DEPT-CS-012",
    quotation_id: "Q2024-012",
    requirements: "Cloud Computing Credits - AWS Educate program",
    status: "Pending",
    product_category: "Software Licenses",
    created_date: "2024-06-12",
  },
  {
    client_id: "DEPT-CS-013",
    quotation_id: "Q2024-013",
    requirements: "Smart classroom equipment - projectors and screens",
    status: "Rejected",
    product_category: "Infrastructure",
    created_date: "2024-06-05",
  },
  {
    client_id: "DEPT-CS-014",
    quotation_id: "Q2024-014",
    requirements: "Laboratory furniture and workbenches",
    status: "Rejected",
    product_category: "Miscellaneous",
    created_date: "2024-06-08",
  },
];

const vendorResponses: VendorResponse[] = [
  {
    vendor_id: "V001",
    quotation_id: "Q2024-001",
    vendor_name: "Dell Technologies",
    description:
      "Dell Precision 5820 Tower - 15 units, i7-11700K, 32GB DDR4, 1TB SSD",
    amount: 42500,
    submitted_date: "2024-01-16",
  },
  {
    vendor_id: "V002",
    quotation_id: "Q2024-001",
    vendor_name: "HP Enterprise",
    description:
      "HP Z4 G4 Workstation - 15 units, i7-11700, 32GB RAM, 512GB SSD",
    amount: 45000,
    submitted_date: "2024-01-16",
  },
  {
    vendor_id: "V003",
    quotation_id: "Q2024-002",
    vendor_name: "MathWorks Inc.",
    description: "MATLAB Campus-Wide License - 500 concurrent users, 1 year",
    amount: 18500,
    submitted_date: "2024-01-21",
  },
  {
    vendor_id: "V004",
    quotation_id: "Q2024-011",
    vendor_name: "NVIDIA Enterprise",
    description: "DGX Station A100 - 3 units with 4x A100 80GB GPUs each",
    amount: 45000,
    submitted_date: "2024-06-19",
  },
  {
    vendor_id: "V005",
    quotation_id: "Q2024-011",
    vendor_name: "Lambda Labs",
    description: "Lambda Hyperplane A100 Server - 3 units, 8x A100 40GB",
    amount: 52000,
    submitted_date: "2024-06-19",
  },
  {
    vendor_id: "V006",
    quotation_id: "Q2024-012",
    vendor_name: "Amazon Web Services",
    description: "AWS Educate Credits - ₹28,000 credit allocation",
    amount: 28000,
    submitted_date: "2024-06-13",
  },
];

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

const Dashboard = () => {
  // Calculate monthly trend from quotation requests
  const getMonthlyTrend = () => {
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
    const monthlyData: {
      [key: string]: { expenses: number; total: number; approved: number };
    } = {};

    quotationRequests.forEach((quote) => {
      const date = new Date(quote.created_date);
      const monthKey = monthNames[date.getMonth()];

      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = { expenses: 0, total: 0, approved: 0 };
      }

      monthlyData[monthKey].total += 1;

      if (quote.status === "Approved" && quote.approved_amount) {
        monthlyData[monthKey].expenses += quote.approved_amount;
        monthlyData[monthKey].approved += 1;
      }
    });

    return monthNames
      .map((month) => ({
        month,
        expenses: monthlyData[month]?.expenses || 0,
        quotations: monthlyData[month]?.total || 0,
        approved: monthlyData[month]?.approved || 0,
      }))
      .filter((data) => data.quotations > 0);
  };

  // Calculate expense by category from quotation requests
  const getExpenseByCategory = () => {
    const categoryData: { [key: string]: number } = {};

    quotationRequests.forEach((quote) => {
      if (quote.status === "Approved" && quote.approved_amount) {
        if (!categoryData[quote.product_category]) {
          categoryData[quote.product_category] = 0;
        }
        categoryData[quote.product_category] += quote.approved_amount;
      }
    });

    const totalExpenses = Object.values(categoryData).reduce(
      (sum, val) => sum + val,
      0,
    );
    const colors = [
      "#2563eb",
      "#7c3aed",
      "#0891b2",
      "#16a34a",
      "#ec4899",
      "#ea580c",
      "#6b7280",
    ];

    return Object.entries(categoryData)
      .map(([category, amount], index) => ({
        category,
        amount,
        color: colors[index % colors.length],
        percentage: Math.round((amount / totalExpenses) * 100),
      }))
      .sort((a, b) => b.amount - a.amount);
  };

  // Calculate quotation status summary
  const getQuotationStatusSummary = () => {
    const statusData: { [key: string]: { count: number; value: number } } = {
      Approved: { count: 0, value: 0 },
      Pending: { count: 0, value: 0 },
      "Under Review": { count: 0, value: 0 },
      Rejected: { count: 0, value: 0 },
    };

    quotationRequests.forEach((quote) => {
      statusData[quote.status].count += 1;
      if (quote.approved_amount) {
        statusData[quote.status].value += quote.approved_amount;
      } else {
        const vendorResponse = vendorResponses.find(
          (v) => v.quotation_id === quote.quotation_id,
        );
        if (vendorResponse) {
          statusData[quote.status].value += vendorResponse.amount;
        }
      }
    });

    const colors: { [key: string]: string } = {
      Approved: "#16a34a",
      Pending: "#f59e0b",
      "Under Review": "#3b82f6",
      Rejected: "#ef4444",
    };

    return Object.entries(statusData).map(([status, data]) => ({
      status,
      count: data.count,
      value: data.value,
      color: colors[status],
    }));
  };

  const monthlyTrend = getMonthlyTrend();
  const expenseByCategory = getExpenseByCategory();
  const quotationsByStatus = getQuotationStatusSummary();

  const totalExpenses = transactions
    .filter((t) => t.payment_status === "Paid")
    .reduce((sum, t) => sum + t.amount, 0);

  const totalQuotations = vendorResponses.reduce((sum, v) => sum + v.amount, 0);

  const approvedAmount =
    quotationsByStatus.find((q) => q.status === "Approved")?.value || 0;

  const pendingQuotations = quotationRequests.filter(
    (q) => q.status === "Pending" || q.status === "Under Review",
  );

  const pendingValue = pendingQuotations.reduce((sum, q) => {
    const vendorResponse = vendorResponses.find(
      (v) => v.quotation_id === q.quotation_id,
    );
    return sum + (vendorResponse?.amount || 0);
  }, 0);

  const recentTransactions = transactions
    .sort(
      (a, b) =>
        new Date(b.transaction_date).getTime() -
        new Date(a.transaction_date).getTime(),
    )
    .slice(0, 5);

  const currentMonth = monthlyTrend[monthlyTrend.length - 1] || {
    quotations: 0,
    approved: 0,
  };

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
          <p className="text-sm font-medium text-gray-600">
            Total Paid Expenses
          </p>
          <p className="text-2xl font-bold text-gray-900 mt-1">
            ₹{totalExpenses.toLocaleString()}
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
            {transactions.filter((t) => t.payment_status === "Paid").length}{" "}
            transactions completed
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
            Total Vendor Responses
          </p>
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
          <p className="text-sm font-medium text-gray-600">
            Approved Quotations
          </p>
          <p className="text-2xl font-bold text-gray-900 mt-1">
            ₹{approvedAmount.toLocaleString()}
          </p>
          <p className="text-xs text-green-600 mt-2">
            {quotationsByStatus.find((q) => q.status === "Approved")?.count ||
              0}{" "}
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
        {/* Monthly Trend Chart */}
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
                formatter={(value) => `₹${value?.toLocaleString()}`}
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
              <Tooltip formatter={(value) => `₹${value.toLocaleString()}`} />
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-600">
                Total Expenses
              </span>
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
              const quotation = quotationRequests.find(
                (q) => q.quotation_id === transaction.quotation_id,
              );
              const statusColors = {
                Paid: "bg-green-100 text-green-700",
                Pending: "bg-orange-100 text-orange-700",
                Processing: "bg-blue-100 text-blue-700",
                Failed: "bg-red-100 text-red-700",
              };

              return (
                <div
                  key={index}
                  className="border-l-4 pl-4 py-2 hover:bg-gray-50 transition-colors"
                  style={{
                    borderColor:
                      transaction.payment_status === "Paid"
                        ? "#16a34a"
                        : "#f59e0b",
                  }}
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
                          className={`text-xs px-2 py-1 rounded font-medium ${statusColors[transaction.payment_status]}`}
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

      {/* Quotation Requests & Vendor Responses Table */}
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
              {quotationRequests
                .slice(-5)
                .reverse()
                .map((quote, index) => {
                  const responses = vendorResponses.filter(
                    (v) => v.quotation_id === quote.quotation_id,
                  );
                  return (
                    <tr
                      key={index}
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
                        {responses.length} vendor
                        {responses.length !== 1 ? "s" : ""}
                        {responses.length > 0 && (
                          <span className="text-xs text-gray-500 ml-1">
                            ($
                            {Math.min(
                              ...responses.map((r) => r.amount),
                            ).toLocaleString()}{" "}
                            - $
                            {Math.max(
                              ...responses.map((r) => r.amount),
                            ).toLocaleString()}
                            )
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`text-xs px-3 py-1 rounded-full font-medium ${
                            quote.status === "Approved"
                              ? "bg-green-100 text-green-700"
                              : quote.status === "Under Review"
                                ? "bg-blue-100 text-blue-700"
                                : quote.status === "Pending"
                                  ? "bg-orange-100 text-orange-700"
                                  : "bg-red-100 text-red-700"
                          }`}
                        >
                          {quote.status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
