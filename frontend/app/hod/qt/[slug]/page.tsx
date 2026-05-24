"use client";

import { useParams } from "next/navigation";
import { QuotationDetailsById } from "@/app/components/QuotationDetailsById";
import { VendorResponsesById } from "@/app/components/VendorResponsesById";

export default function QtDetailsPage() {
  const params = useParams();
  const slug = Array.isArray(params.slug) ? params.slug[0] : params.slug;

  if (!slug) {
    return (
      <div className="flex min-h-screen bg-[#F2F2F2] font-sans">
        <div className="flex w-full items-center justify-center">
          <p className="text-[14px] font-medium text-[#929090]">
            Invalid quotation ID.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[#F2F2F2] font-sans">
      <main className="flex-1 px-[clamp(20px,4vw,40px)] py-[clamp(24px,4vw,40px)] transition-[margin-left] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] max-md:ml-[68px]">
        <div className="mx-auto flex max-w-[1200px] flex-col gap-6">
          {/* Base Quotation Information */}
          <QuotationDetailsById quotationId={slug} />

          {/* Submissions by Vendors */}
          <VendorResponsesById quotationId={slug} />
        </div>
      </main>
    </div>
  );
}
