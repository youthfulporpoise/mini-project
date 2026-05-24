import Dashboard from "../components/Dashboard";
import {
  fetchQuotations,
  fetchResponses,
  getAllTransactionDetails,
} from "../utility/api";
import {
  QuotationRequestRow,
  VendorResponseRow,
  RazorpayTransaction,
  QuotationStatus,
} from "../utility/index";

// Map backend statuses from database safely to our QuotationStatus type
const mapQuotationStatus = (status: number | string): QuotationStatus => {
  const s = String(status).toUpperCase();
  if (s === "1" || s === "APPROVED") return "APPROVED";
  if (s === "3" || s === "REJECTED") return "REJECTED";
  if (s === "5" || s === "SUCCESS") return "SUCCESS";
  if (s === "DELIVERED") return "DELIVERED";
  return "PENDING"; // Fallback covers 0, 2, "PENDING", "UNDER_REVIEW", etc.
};

export default async function DashboardPage() {
  const [quotationsData, responsesData, transactionsData] = await Promise.all([
    fetchQuotations().catch(() => []),
    fetchResponses().catch(() => []),
    getAllTransactionDetails().catch(() => null),
  ]);

  const rawQuotations = Array.isArray(quotationsData)
    ? quotationsData
    : quotationsData?.data || [];
  const mappedQuotations: QuotationRequestRow[] = rawQuotations.map(
    (q: any) => ({
      id: String(q.id),
      quotationTitle:
        q.quotationTitle || q.title || q.description || "Untitled Request",
      department: q.department || "General",
      category: q.category || "Uncategorized",
      status: mapQuotationStatus(q.status),
      submissionDeadline:
        q.submissionDeadline ||
        q.submission_deadline ||
        new Date().toISOString(),
    }),
  );

  const rawResponses = Array.isArray(responsesData)
    ? responsesData
    : responsesData?.data || [];
  const mappedResponses: VendorResponseRow[] = rawResponses.flatMap(
    (response: any) =>
      response.response_items?.map((item: any) => ({
        quotation_id: String(response.quotation),
        amount: Number(item.unit_price) || 0,
      })) || [],
  );

  // Parse Razorpay payload
  let parsedTransactions: RazorpayTransaction[] = [];
  if (transactionsData?.items && Array.isArray(transactionsData.items)) {
    parsedTransactions = transactionsData.items;
  } else if (Array.isArray(transactionsData)) {
    parsedTransactions = transactionsData;
  }

  // Sort transactions to show newest first
  parsedTransactions.sort((a, b) => b.created_at - a.created_at);

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className=" overflow-y-auto p-6">
          <Dashboard
            quotationRequests={mappedQuotations}
            vendorResponses={mappedResponses}
            transactions={parsedTransactions}
          />
        </main>
      </div>
    </div>
  );
}
