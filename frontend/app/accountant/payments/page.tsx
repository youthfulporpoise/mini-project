"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { Sidebar } from "@/app/components/Sidebar"; // Adjust path if needed
import PaymentButton from "@/app/components/PaymentButton"; // Adjust path if needed
import {
  CreditCard,
  PackageCheck,
  FileText,
  Building2,
  Clock,
} from "lucide-react";
import { BACKEND_URL } from "@/app/utility";
import { fetchQuotations, fetchResponses } from "@/app/utility/api";

interface PayableQuotation {
  id: string | number;
  title: string;
  department: string;
  category: string;
  status: string;
  vendorId: string | number | null;
  amount: number;
}

export default function PendingPaymentsPage() {
  const [payableInvoices, setPayableInvoices] = useState<PayableQuotation[]>(
    [],
  );
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadPaymentsQueue = async () => {
      setIsLoading(true);
      try {
        // Fetch all required data concurrently
        const [qtRes, acceptedRes, responsesRes] = await Promise.all([
          fetchQuotations(),
          axios
            .get(`${BACKEND_URL}/quotations/accepted/`)
            .catch(() => ({ data: [] })),
          fetchResponses().catch(() => []),
        ]);

        const rawQuotations = Array.isArray(qtRes) ? qtRes : qtRes.data || [];
        const acceptedRecords = Array.isArray(acceptedRes.data)
          ? acceptedRes.data
          : [];
        const allResponses = Array.isArray(responsesRes)
          ? responsesRes
          : responsesRes.data || [];

        // 1. Filter ONLY quotations that are successfully DELIVERED
        const deliveredQuotations = rawQuotations.filter(
          (q: any) => q.status === "DELIVERED",
        );

        // 2. Map and calculate the exact amount to be paid
        const enrichedInvoices: PayableQuotation[] = deliveredQuotations.map(
          (d: any) => {
            const acceptedRecord = acceptedRecords.find(
              (acc: any) => String(acc.quotation) === String(d.id),
            );
            let amount = 0;
            let vendorId = null;

            if (acceptedRecord) {
              const winningResponse = allResponses.find(
                (r: any) => String(r.id) === String(acceptedRecord.response),
              );
              if (winningResponse) {
                vendorId = winningResponse.vendor;
                amount =
                  winningResponse.response_items?.reduce(
                    (sum: number, item: any) =>
                      sum + (Number(item.unit_price) || 0),
                    0,
                  ) || 0;
              }
            }

            return {
              id: d.id,
              title: d.title || d.description,
              department: d.department,
              category: d.category,
              status: d.status,
              vendorId,
              amount,
            };
          },
        );

        setPayableInvoices(enrichedInvoices);
      } catch (error) {
        console.error("Failed to load payments queue:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadPaymentsQueue();
  }, []);

  const totalPendingAmount = payableInvoices.reduce(
    (sum, inv) => sum + inv.amount,
    0,
  );

  return (
    <div className="flex min-h-screen bg-[#F2F2F2] font-sans text-[#111110]">
      <main className="flex-1 px-[clamp(20px,4vw,40px)] py-[clamp(24px,4vw,40px)] transition-[margin-left] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] max-md:ml-[68px]">
        <div className="mx-auto max-w-[1000px]">
          {/* ── Header ── */}
          <div className="mb-8 flex flex-wrap items-end justify-between gap-6 rounded-[14px] border border-black/[0.06] bg-white p-6 shadow-sm">
            <div>
              <div className="mb-2 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#FB4D27]/10">
                  <CreditCard size={20} className="text-[#FB4D27]" />
                </div>
                <h1 className="text-[22px] font-bold tracking-[-0.03em] text-[#111110]">
                  Payment Settlement
                </h1>
              </div>
              <p className="text-[13.5px] text-[#929090]">
                Process payments for vendor invoices on successfully delivered
                orders.
              </p>
            </div>

            <div className="flex gap-6 text-right">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.06em] text-[#929090]">
                  Pending Invoices
                </p>
                <p className="font-mono text-[28px] font-bold text-[#111110]">
                  {payableInvoices.length}
                </p>
              </div>
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.06em] text-[#929090]">
                  Total Amount Due
                </p>
                <p className="font-mono text-[28px] font-bold text-[#111110]">
                  ₹{totalPendingAmount.toLocaleString("en-IN")}
                </p>
              </div>
            </div>
          </div>

          {/* ── Invoices List ── */}
          <div className="flex flex-col gap-5">
            <h2 className="text-[16px] font-bold text-[#111110]">
              Delivered & Pending Payment
            </h2>

            {isLoading ? (
              <div className="flex flex-col items-center justify-center rounded-[14px] border border-black/[0.06] bg-white py-20 text-[#929090] shadow-sm">
                <div className="mb-4 h-8 w-8 animate-spin rounded-full border-[3px] border-[#111110] border-r-transparent" />
                <p className="text-[13px] font-medium">
                  Loading payable invoices...
                </p>
              </div>
            ) : payableInvoices.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-[14px] border border-black/[0.06] bg-white py-16 text-center shadow-sm">
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#28CA41]/10">
                  <PackageCheck size={28} className="text-[#1a8c30]" />
                </div>
                <h3 className="mb-1 text-[16px] font-bold text-[#111110]">
                  All Cleared Up!
                </h3>
                <p className="text-[13.5px] text-[#929090]">
                  There are no delivered orders awaiting payment.
                </p>
              </div>
            ) : (
              payableInvoices.map((invoice) => (
                <div
                  key={invoice.id}
                  className="flex flex-col overflow-hidden rounded-[14px] border border-black/[0.08] bg-white shadow-sm transition-all hover:border-black/15 md:flex-row md:items-stretch"
                >
                  {/* Left Side: Details */}
                  <div className="flex-1 p-6">
                    <div className="mb-2 flex items-center gap-3">
                      <span className="font-mono text-[11.5px] font-bold uppercase tracking-[0.06em] text-[#929090]">
                        REQ #{invoice.id}
                      </span>
                      <span className="flex items-center gap-1 rounded-full bg-[#5B7FA6]/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.04em] text-[#5B7FA6]">
                        <PackageCheck size={12} /> Delivered
                      </span>
                    </div>

                    <h3 className="mb-3 text-[18px] font-bold leading-snug text-[#111110]">
                      {invoice.title}
                    </h3>

                    <div className="flex flex-wrap items-center gap-4 text-[13px] font-medium text-[#4C433F]">
                      <span className="flex items-center gap-1.5 rounded-md border border-black/5 bg-[#F2F2F2] px-2.5 py-1">
                        <FileText size={14} className="text-[#929090]" />{" "}
                        {invoice.department}
                      </span>
                      <span className="flex items-center gap-1.5 rounded-md border border-black/5 bg-[#F2F2F2] px-2.5 py-1">
                        <Building2 size={14} className="text-[#929090]" />{" "}
                        Vendor: {invoice.vendorId || "Unknown"}
                      </span>
                    </div>
                  </div>

                  {/* Right Side: Payment Action */}
                  <div className="flex flex-col justify-center border-t border-black/[0.04] bg-[#FAFAFA] p-6 md:w-[320px] md:border-l md:border-t-0">
                    <p className="mb-1 text-[11px] font-semibold uppercase tracking-[0.06em] text-[#929090]">
                      Final Invoice Amount
                    </p>
                    <p className="mb-4 font-mono text-[32px] font-bold text-[#111110]">
                      ₹{invoice.amount.toLocaleString("en-IN")}
                    </p>

                    {/* Injecting your custom PaymentButton component */}
                    <div className="w-full">
                      <PaymentButton
                        quotationId={String(invoice.id)}
                        amount={invoice.amount}
                      />
                    </div>

                    <p className="mt-3 flex justify-center items-center gap-1 text-[11px] font-medium text-[#929090]">
                      <Clock size={12} /> Pending Settlement
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
