"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Cookies from "js-cookie";
import { ArrowLeft, FileText, CheckCircle2, Clock, Package } from "lucide-react";
import VendorResponseForm from "@/app/components/VendorResponseForm"; // Adjust path if needed
import { fetchQuotationById, fetchResponses } from "@/app/utility/api";
import { Quotation } from "@/app/utility/index";

export default function VendorQuotationDetails() {
  const router = useRouter();
  const params = useParams();
  const slug = Array.isArray(params.slug) ? params.slug[0] : params.slug;

  const [quotation, setQuotation] = useState<Quotation | null>(null);
  const [existingResponse, setExistingResponse] = useState<any | null>(null);
  const [vendorProfile, setVendorProfile] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;

    const loadData = async () => {
      setIsLoading(true);
      try {
        // 1. Get Vendor ID from Cookie
        let currentVendorId = null;
        const cookieData = Cookies.get("userProfile");
        if (cookieData) {
          const profile = JSON.parse(decodeURIComponent(cookieData));
          setVendorProfile(profile);
          currentVendorId = profile.id;
        }

        // 2. Fetch Quotation Details
        const qtResponse = await fetchQuotationById(slug as string)
        const qtData = qtResponse;
        
        const formattedQuotation: Quotation = {
          id: qtData.id,
          category: qtData.category,
          quotationTitle: qtData.title,
          description: qtData.description,
          department: qtData.department,
          submissionDeadline: qtData.submission_deadline,
          deliveryPeriod: qtData.delivery_period,
          status: qtData.status,
          qtReqVerifiedAccountant: qtData.qt_req_verified_accountant,
          finalQtVerifiedAccountant: qtData.final_qt_verified_accountant,
          qtVerifiedPrincipal: qtData.qt_verified_principal,
          items: qtData.items.map((item: any) => ({
            id: item.id,
            itemName: item.name,
            itemDescription: item.description,
            amount: item.amount,
          })),
        };
        setQuotation(formattedQuotation);

        // 3. Fetch Responses & Check if this Vendor already submitted
        if (currentVendorId) {
          const allResponses = await fetchResponses();
          const myResponse = allResponses.find(
            (r: any) => String(r.quotation) === String(slug) && String(r.vendor) === String(currentVendorId)
          );
          
          if (myResponse) {
            setExistingResponse(myResponse);
          }
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [slug]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen bg-[#F2F2F2] font-sans">
   
        <div className="flex flex-1 items-center justify-center">
          <div className="flex flex-col items-center gap-3 text-[#929090]">
            <div className="h-8 w-8 animate-spin rounded-full border-[3px] border-[#FB4D27] border-r-transparent" />
            <p className="text-[13px] font-medium">Checking quotation status...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!quotation) return null;

  const totalEstBudget = quotation.items.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);

  return (
    <div className="flex min-h-screen bg-[#F2F2F2] font-sans">

      <main className="flex-1 px-[clamp(20px,4vw,40px)] py-[clamp(24px,4vw,40px)] transition-[margin-left] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] max-md:ml-[68px]">
        <div className="mx-auto max-w-[1000px]">
          
          <button
            onClick={() => router.back()}
            className="mb-6 inline-flex items-center gap-2 text-[13.5px] font-semibold text-[#929090] transition-colors hover:text-[#111110]"
          >
            <ArrowLeft size={16} /> Back to Dashboard
          </button>

          {/* ── Quotation Header ── */}
          <div className="mb-8 flex flex-wrap items-end justify-between gap-6 rounded-[14px] border border-black/[0.06] bg-white p-6 shadow-sm">
            <div>
              <div className="mb-2 flex items-center gap-2.5 text-[#111110]">
                <FileText size={20} className="text-[#FB4D27]" />
                <h1 className="text-[20px] font-bold tracking-[-0.02em]">
                  {quotation.quotationTitle}
                </h1>
              </div>
              <p className="text-[14px] font-medium text-[#4C433F]">
                Req <span className="font-mono text-[#929090]">#{quotation.id}</span> · {quotation.department}
              </p>
            </div>
            <div className="text-right">
              <p className="text-[11px] font-semibold uppercase tracking-[0.06em] text-[#929090]">Est. Budget Limit</p>
              <p className="font-mono text-[24px] font-bold text-[#111110]">₹{totalEstBudget.toLocaleString('en-IN')}</p>
            </div>
          </div>

          {/* ── Quotation Details ── */}
          <div className="mb-8 overflow-hidden rounded-[14px] border border-black/[0.06] bg-white shadow-sm">
            <div className="border-b border-black/[0.06] bg-[#FAFAFA] px-6 py-4">
              <h3 className="text-[15px] font-bold text-[#111110]">Requested Items</h3>
            </div>
            <div className="grid grid-cols-1 gap-4 p-6 md:grid-cols-2">
              {quotation.items.map((item, i) => (
                <div key={item.id} className="rounded-[10px] border border-black/5 bg-[#F9FAFB] p-4">
                  <div className="mb-2 flex items-center justify-between">
                    <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.06em] text-[#929090]">
                      Item {String(i + 1).padStart(2, '0')}
                    </span>
                    <span className="font-mono text-[14px] font-bold text-[#111110]">
                      ₹{Number(item.amount).toLocaleString('en-IN')}
                    </span>
                  </div>
                  <h4 className="text-[14px] font-bold text-[#111110]">{item.itemName}</h4>
                  <p className="mt-1 text-[12.5px] leading-relaxed text-[#4C433F]">{item.itemDescription}</p>
                </div>
              ))}
            </div>
          </div>

          {/* ── Conditional Rendering: Form OR Success Card ── */}
          {existingResponse ? (
            <div className="overflow-hidden rounded-[14px] border border-[#28CA41]/30 bg-white shadow-[0_8px_30px_rgba(40,202,65,0.08)] ring-1 ring-[#28CA41]/10">
              <div className="flex items-center gap-3 border-b border-black/[0.04] bg-[#28CA41]/10 px-6 py-5">
                <CheckCircle2 size={24} className="text-[#1a8c30]" />
                <div>
                  <h3 className="text-[16px] font-bold text-[#1a8c30]">Quotation Submitted Successfully</h3>
                  <p className="text-[13px] font-medium text-[#1a8c30]/80">You have already responded to this request.</p>
                </div>
              </div>
              
              <div className="p-6">
                <div className="mb-6 flex flex-wrap gap-6 rounded-[10px] border border-black/5 bg-[#FAFAFA] p-5">
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.06em] text-[#929090]">Your Total Bid</p>
                    <p className="font-mono text-[24px] font-bold text-[#111110]">
                      ₹{existingResponse.response_items.reduce((sum: number, item: any) => sum + Number(item.unit_price), 0).toLocaleString('en-IN')}
                    </p>
                  </div>
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.06em] text-[#929090]">Current Status</p>
                    <div className="mt-1 inline-flex items-center gap-1.5 rounded-full border border-[#FFBD2E]/25 bg-[#FFBD2E]/15 px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.04em] text-[#9a6e00]">
                      <Clock size={14} /> {existingResponse.status?.replace('_', ' ') || "PENDING REVIEW"}
                    </div>
                  </div>
                </div>

                <h4 className="mb-3 text-[14px] font-bold text-[#111110]">Your Submitted Items</h4>
                <div className="flex flex-col gap-3">
                  {existingResponse.response_items.map((item: any, i: number) => (
                    <div key={item.id || i} className="flex flex-col justify-between rounded-[8px] border border-black/5 p-4 sm:flex-row sm:items-center">
                      <div>
                        <p className="text-[14px] font-bold text-[#111110]">{item.brand_model}</p>
                        <p className="mt-0.5 flex items-center gap-1.5 text-[12px] text-[#929090]">
                          <Package size={12} /> {item.delivery_period}
                        </p>
                      </div>
                      <span className="mt-2 font-mono text-[15px] font-bold text-[#111110] sm:mt-0">
                        ₹{Number(item.unit_price).toLocaleString('en-IN')}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <VendorResponseForm 
              quotationId={quotation.id as string} 
              vendorId={vendorProfile?.id || 0} // Pass parsed vendor ID
              quotationItems={quotation.items}
              setSubmittedResponse={(res) => setExistingResponse({
                ...res,
                response_items: res.responseItems.map(i => ({
                  brand_model: i.brandModel,
                  unit_price: i.unitPrice,
                  delivery_period: i.deliveryPeriod
                }))
              })}
            />
          )}

        </div>
      </main>
    </div>
  );
}