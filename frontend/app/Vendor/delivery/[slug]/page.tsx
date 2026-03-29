"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import axios from "axios";
import Cookies from "js-cookie";
import {
  ArrowLeft,
  CheckCircle2,
  Package,
  FileText,
  ShieldCheck,
  Truck,
  KeyRound,
  Mail,
} from "lucide-react";
import { BACKEND_URL } from "@/app/utility";
import { fetchResponses, generateOTP } from "@/app/utility/api"; // Added generateOTP

export default function VendorDeliveryPage() {
  const router = useRouter();
  const params = useParams();
  const slug = Array.isArray(params.slug) ? params.slug[0] : params.slug;

  const [quotation, setQuotation] = useState<any>(null);
  const [vendorResponse, setVendorResponse] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  // OTP States
  const [otpSent, setOtpSent] = useState<boolean>(false);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    if (!slug) return;

    const loadData = async () => {
      setIsLoading(true);
      try {
        // 1. Get current vendor ID from cookies
        let currentVendorId = null;
        const cookieData = Cookies.get("userProfile");
        if (cookieData) {
          const profile = JSON.parse(decodeURIComponent(cookieData));
          currentVendorId = profile.id;
        }

        if (!currentVendorId) {
          console.warn("No vendor profile found in cookies.");
          setIsLoading(false);
          return;
        }

        // 2. Fetch the quotation details
        const qtRes = await axios.get(`${BACKEND_URL}/qt/${slug}`);
        setQuotation(qtRes.data);

        // 3. Fetch the accepted quotations list
        const acceptedRes = await axios.get(
          `${BACKEND_URL}/quotations/accepted/`,
        );

        // Find if this specific quotation has an accepted record
        const acceptedRecord = acceptedRes.data.find(
          (record: any) => String(record.quotation) === String(slug),
        );

        if (acceptedRecord) {
          // 4. Fetch all responses to find the specific winning response
          const allResponsesRes = await fetchResponses();
          const responsesArray = Array.isArray(allResponsesRes)
            ? allResponsesRes
            : allResponsesRes.data;

          const winningResponse = responsesArray.find(
            (r: any) => String(r.id) === String(acceptedRecord.response),
          );

          // 5. SECURITY CHECK: Does the winning response belong to the logged-in vendor?
          if (
            winningResponse &&
            String(winningResponse.vendor) === String(currentVendorId)
          ) {
            setVendorResponse(winningResponse);
          } else {
            console.warn(
              "An accepted response exists, but it does not belong to the current vendor.",
            );
          }
        }
      } catch (error) {
        console.error("Error loading delivery details:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [slug]);

  // Use the new API utility to generate and send the OTP to the email
  const handleGenerateOtp = async () => {
    setIsGenerating(true);

    const response = await generateOTP(slug as string);

    if (response) {
      setOtpSent(true);
    } else {
      alert(
        "Unable to generate delivery OTP. Please try again or contact support.",
      );
    }

    setIsGenerating(false);
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F2F2F2] font-sans">
        <div className="flex flex-col items-center gap-3 text-[#929090]">
          <div className="h-8 w-8 animate-spin rounded-full border-[3px] border-[#FB4D27] border-r-transparent" />
          <p className="text-[13px] font-medium">
            Verifying approval status...
          </p>
        </div>
      </div>
    );
  }

  // Secure Block: Only renders if the vendor matches the accepted response
  if (!vendorResponse) {
    return (
      <div className="flex min-h-screen bg-[#F2F2F2] font-sans">
        <div className="flex flex-1 items-center justify-center p-6">
          <div className="flex max-w-[400px] flex-col items-center gap-3 rounded-[14px] border border-black/[0.06] bg-white p-8 text-center shadow-sm">
            <Package className="h-12 w-12 text-[#D3D6DA]" />
            <h3 className="text-[16px] font-bold text-[#111110]">
              No Approved Delivery Found
            </h3>
            <p className="text-[13px] text-[#929090]">
              Your quotation for this request has not been approved yet, or
              another vendor was selected.
            </p>
            <button
              onClick={() => router.back()}
              className="mt-4 rounded-[9px] bg-[#111110] px-6 py-2.5 text-[13.5px] font-semibold text-white transition-colors hover:bg-[#FB4D27]"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  const totalBidAmount = vendorResponse.response_items.reduce(
    (sum: number, item: any) => sum + (Number(item.unit_price) || 0),
    0,
  );

  return (
    <div className="flex min-h-screen bg-[#F2F2F2] font-sans selection:bg-[#28CA41]/20 selection:text-[#1a8c30]">
      <main className="flex-1 px-[clamp(20px,4vw,40px)] py-[clamp(24px,4vw,40px)] transition-[margin-left] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] max-md:ml-[68px]">
        <div className="mx-auto max-w-[1000px]">
          <button
            onClick={() => router.back()}
            className="mb-6 inline-flex items-center gap-2 text-[13.5px] font-semibold text-[#929090] transition-colors hover:text-[#111110]"
          >
            <ArrowLeft size={16} /> Back to Dashboard
          </button>

          {/* ── Approved Banner ── */}
          <div className="mb-6 flex flex-wrap items-center justify-between gap-6 rounded-[14px] border border-[#28CA41]/30 bg-[#28CA41]/10 p-6 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#28CA41]/20">
                <CheckCircle2 size={24} className="text-[#1a8c30]" />
              </div>
              <div>
                <h2 className="text-[18px] font-bold tracking-[-0.01em] text-[#1a8c30]">
                  Quotation Officially Approved!
                </h2>
                <p className="text-[13.5px] font-medium text-[#1a8c30]/80">
                  The institution has accepted your bid. Please proceed with the
                  delivery.
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            {/* ── Delivery Details ── */}
            <div className="flex flex-col gap-6 lg:col-span-2">
              <div className="overflow-hidden rounded-[14px] border border-black/[0.06] bg-white shadow-sm">
                <div className="flex items-center justify-between border-b border-black/[0.06] bg-[#FAFAFA] px-6 py-4">
                  <h3 className="flex items-center gap-2 text-[15px] font-bold text-[#111110]">
                    <FileText size={16} className="text-[#FB4D27]" />
                    Delivery Commitment
                  </h3>
                  <span className="font-mono text-[18px] font-bold text-[#111110]">
                    ₹{totalBidAmount.toLocaleString("en-IN")}
                  </span>
                </div>

                <div className="p-6">
                  <div className="mb-6 border-b border-black/[0.04] pb-6">
                    <p className="mb-1 text-[11px] font-semibold uppercase tracking-[0.06em] text-[#929090]">
                      Institution Request
                    </p>
                    <h4 className="text-[16px] font-bold text-[#111110]">
                      {quotation?.title}
                    </h4>
                    <p className="text-[13px] text-[#4C433F]">
                      Req <span className="font-mono">#{quotation?.id}</span> ·{" "}
                      {quotation?.department}
                    </p>
                  </div>

                  <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.06em] text-[#929090]">
                    Items to Deliver
                  </p>
                  <div className="flex flex-col gap-3">
                    {vendorResponse.response_items.map(
                      (item: any, i: number) => (
                        <div
                          key={item.id || i}
                          className="flex justify-between rounded-[10px] border border-black/5 bg-[#F9FAFB] p-4 text-[13.5px]"
                        >
                          <div>
                            <p className="font-bold text-[#111110]">
                              {item.brand_model}
                            </p>
                            <p className="mt-1 flex items-center gap-1.5 text-[12px] text-[#929090]">
                              <Truck size={14} /> Deliver within:{" "}
                              <span className="font-semibold text-[#111110]">
                                {item.delivery_period}
                              </span>
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
            </div>

            {/* ── OTP Action Panel ── */}
            <div className="flex flex-col gap-4">
              <div className="rounded-[14px] border border-[#5B7FA6]/30 bg-white p-6 shadow-sm ring-1 ring-[#5B7FA6]/10">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-[12px] bg-[#5B7FA6]/10">
                  <ShieldCheck size={24} className="text-[#5B7FA6]" />
                </div>
                <h3 className="mb-2 text-[16px] font-bold text-[#111110]">
                  Delivery Verification
                </h3>
                <p className="mb-6 text-[13px] leading-relaxed text-[#929090]">
                  At the time of delivery, generate a secure OTP and provide it
                  to the institution's receiving officer to officially verify
                  the handover.
                </p>

                {otpSent ? (
                  <div className="animate-in zoom-in fade-in rounded-[10px] border-[1.5px] border-[#28CA41] bg-[#28CA41]/5 p-5 text-center duration-300">
                    <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-[#28CA41]/15">
                      <Mail size={24} className="text-[#1a8c30]" />
                    </div>
                    <p className="mb-1 text-[13.5px] font-bold text-[#1a8c30]">
                      OTP Sent to Email
                    </p>
                    <p className="text-[12px] font-medium text-[#4C433F]">
                      Please check your registered email inbox for the 6-digit
                      delivery code and share it with the HOD.
                    </p>
                    <button
                      onClick={handleGenerateOtp}
                      className="mt-4 text-[12px] font-semibold text-[#5B7FA6] hover:underline"
                    >
                      Resend Code
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={handleGenerateOtp}
                    disabled={isGenerating}
                    className="flex w-full items-center justify-center gap-2 rounded-[9px] bg-[#111110] py-3.5 text-[14px] font-bold text-white transition-all hover:-translate-y-[1px] hover:bg-[#5B7FA6] hover:shadow-[0_4px_12px_rgba(91,127,166,0.3)] disabled:pointer-events-none disabled:opacity-50"
                  >
                    {isGenerating ? (
                      <>
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <KeyRound size={16} /> Send OTP to Email
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
