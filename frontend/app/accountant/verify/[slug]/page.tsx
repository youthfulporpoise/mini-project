"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  ShieldCheck,
  XCircle,
  Building2,
  Trophy,
  Package,
  CheckCircle2,
} from "lucide-react";
import {
  acceptedQuotations,
  fetchQuotationById,
  fetchResponses,
  updateQuotationById,
} from "@/app/utility/api";

export default function FinalVerificationDetails() {
  const router = useRouter();
  const params = useParams();
  const slug = Array.isArray(params.slug) ? params.slug[0] : params.slug;

  const [quotation, setQuotation] = useState<any>(null);
  const [vendorResponse, setVendorResponse] = useState<any>(null);

  // State to track if it's already verified based on the DB check
  const [isAlreadyVerified, setIsAlreadyVerified] = useState(false);

  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        // 1. Fetch Quotation Request Details
        const qtRes = await fetchQuotationById(slug as string);
        setQuotation(qtRes);

        // Check if Accountant already processed this
        if (qtRes.final_qt_verified_accountant) {
          setIsAlreadyVerified(true);
        }

        // 2. Fetch the accepted list and check if this quotation ID is in it
        const acceptedRes = await acceptedQuotations();
        const acceptedRecord = acceptedRes.find(
          (record: any) => String(record.quotation) === String(slug),
        );

        // 3. If found, fetch all responses and find the matching response ID
        if (acceptedRecord) {
          const allResponsesRes = await fetchResponses();

          const responsesArray = Array.isArray(allResponsesRes)
            ? allResponsesRes
            : allResponsesRes;

          const specificResponse = responsesArray.find(
            (r: any) => String(r.id) === String(acceptedRecord.response),
          );

          if (specificResponse) {
            setVendorResponse(specificResponse);
          }
        }
      } catch (error) {
        console.error("Error fetching details", error);
      } finally {
        setIsLoading(false);
      }
    };
    if (slug) fetchDetails();
  }, [slug]);

  const handleAction = async (action: "FORWARD_PRINCIPAL" | "REJECT") => {
    setIsProcessing(true);
    try {
      const payload =
        action === "FORWARD_PRINCIPAL"
          ? { final_qt_verified_accountant: true }
          : { status: "REJECTED" };

      await updateQuotationById(slug as string , payload);

      if (action === "FORWARD_PRINCIPAL") {
        setIsAlreadyVerified(true);
      } else {
        router.push("/accountant");
      }
    } catch (error) {
      console.error("Action failed", error);
      alert("Failed to process request. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F2F2F2] font-sans">
        <div className="flex flex-col items-center gap-3 text-[#929090]">
          <div className="h-8 w-8 animate-spin rounded-full border-[3px] border-[#111110] border-r-transparent" />
          <p className="text-[13px] font-medium">
            Loading verification data...
          </p>
        </div>
      </div>
    );
  }

  if (!quotation) return null;

  const vendorTotal =
    vendorResponse?.response_items?.reduce(
      (sum: number, i: any) => sum + (Number(i.unit_price) || 0),
      0,
    ) || 0;

  return (
    <div className="min-h-screen bg-[#F2F2F2] font-sans selection:bg-[#28CA41]/20 selection:text-[#1a8c30]">
      <div className="mx-auto max-w-[1000px] px-6 py-10">
        <button
          onClick={() => router.back()}
          className="mb-6 inline-flex items-center gap-2 text-[13.5px] font-semibold text-[#929090] transition-colors hover:text-[#111110]"
        >
          <ArrowLeft size={16} /> Back to Dashboard
        </button>

        <div className="mb-6 flex items-center justify-between rounded-[14px] border border-[#28CA41]/30 bg-[#28CA41]/5 p-6 shadow-sm">
          <div>
            <div className="flex items-center gap-2.5">
              <ShieldCheck size={20} className="text-[#1a8c30]" />
              <h1 className="text-[20px] font-bold text-[#111110]">
                Final Compliance Verification
              </h1>
            </div>
            <p className="mt-1 text-[13.5px] text-[#4C433F]">
              Req #{quotation.id} · {quotation.title}
            </p>
          </div>
          <div className="rounded-full bg-[#28CA41]/20 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.04em] text-[#1a8c30]">
            HOD Approved
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="flex flex-col gap-6 lg:col-span-2">
            {vendorResponse ? (
              <div className="overflow-hidden rounded-[14px] border border-[#FB4D27]/30 bg-white shadow-sm ring-1 ring-[#FB4D27]/10">
                <div className="flex items-center justify-between border-b border-black/[0.06] bg-[#FB4D27]/5 px-6 py-4">
                  <div className="flex items-center gap-2 font-bold text-[#111110]">
                    <Trophy size={16} className="text-[#FB4D27]" /> HOD Selected
                    Vendor
                  </div>
                  <span className="font-mono text-[18px] font-bold text-[#111110]">
                    ₹{vendorTotal.toLocaleString("en-IN")}
                  </span>
                </div>
                <div className="p-6">
                  <h4 className="mb-4 flex items-center gap-2 text-[15px] font-bold text-[#111110]">
                    <Building2 size={16} className="text-[#929090]" />
                    {vendorResponse.vendor_name ||
                      `Vendor ID: ${vendorResponse.vendor}`}
                  </h4>
                  <div className="flex flex-col gap-3">
                    {vendorResponse.response_items?.map(
                      (item: any, i: number) => (
                        <div
                          key={item.id || i}
                          className="flex justify-between border-b border-black/5 pb-2 text-[13.5px]"
                        >
                          <div>
                            <p className="font-bold text-[#111110]">
                              {item.brand_model}
                            </p>
                            <p className="flex items-center gap-1 text-[11.5px] text-[#929090]">
                              <Package size={12} /> {item.delivery_period}
                            </p>
                          </div>
                          <span className="font-mono font-semibold text-[#111110]">
                            ₹{Number(item.unit_price).toLocaleString("en-IN")}
                          </span>
                        </div>
                      ),
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="rounded-[14px] border border-red-500/20 bg-red-50 p-6 text-[#c53030]">
                <p className="font-bold">Missing Vendor Data</p>
                <p className="mt-1 text-[13px]">
                  No accepted vendor response was found for this quotation.
                </p>
              </div>
            )}
          </div>

          <div className="flex flex-col gap-4">
            {isAlreadyVerified ? (
              /* ── Success State ── */
              <div className="flex flex-col items-center rounded-[14px] border border-[#28CA41]/30 bg-white p-8 text-center shadow-[0_8px_30px_rgba(40,202,65,0.08)] ring-1 ring-[#28CA41]/10">
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#28CA41]/10">
                  <CheckCircle2 size={28} className="text-[#1a8c30]" />
                </div>
                <h3 className="mb-2 text-[16px] font-bold text-[#111110]">
                  Vendor Selected
                </h3>
                <p className="text-[13px] leading-relaxed text-[#929090]">
                  This quotation has been successfully verified and forwarded to
                  the Principal for final approval.
                </p>
              </div>
            ) : (
              /* ── Action State ── */
              <div className="rounded-[14px] border border-black/[0.06] bg-white p-6 shadow-sm">
                <h3 className="mb-4 font-bold text-[#111110]">
                  Accountant Actions
                </h3>
                <p className="mb-4 text-[12px] leading-relaxed text-[#929090]">
                  Verify the HOD's vendor selection. If financials and
                  compliance are met, forward to the Principal.
                </p>
                <button
                  onClick={() => handleAction("FORWARD_PRINCIPAL")}
                  disabled={isProcessing || !vendorResponse}
                  className="mb-3 flex w-full items-center justify-center gap-2 rounded-[9px] bg-[#28CA41] px-5 py-3 text-[13.5px] font-bold text-white transition-all hover:-translate-y-[1px] hover:bg-[#1a8c30] hover:shadow-md disabled:pointer-events-none disabled:opacity-50"
                >
                  {isProcessing ? (
                    "Processing..."
                  ) : (
                    <>
                      <ShieldCheck size={16} /> Send to Principal
                    </>
                  )}
                </button>
                <button
                  onClick={() => handleAction("REJECT")}
                  disabled={isProcessing}
                  className="flex w-full items-center justify-center gap-2 rounded-[9px] border-[1.5px] border-[#FF5F57]/30 bg-white px-5 py-3 text-[13.5px] font-semibold text-[#c53030] transition-colors hover:bg-[#FF5F57]/5 disabled:pointer-events-none disabled:opacity-50"
                >
                  <XCircle size={15} /> Reject Compliance
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
