"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, FileText, Send, XCircle } from "lucide-react";
import { fetchQuotationById, updateQuotationById } from "@/app/utility/api";

export default function InitialRequestDetails() {
  const router = useRouter();
  const params = useParams();
  const slug = Array.isArray(params.slug) ? params.slug[0] : params.slug;

  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const response = await fetchQuotationById(slug as string);
        setData(response);
      } catch (error) {
        console.error("Error fetching details", error);
      } finally {
        setIsLoading(false);
      }
    };
    if (slug) fetchDetails();
  }, [slug]);

  const handleAction = async (action: "FORWARD" | "REJECT") => {
    try {
      const payload =
        action === "FORWARD"
          ? { qt_req_verified_accountant: true }
          : { status: "REJECTED" };

      await updateQuotationById(slug as string, payload);
      router.push("/accountant");
    } catch (error) {
      console.error("Action failed", error);
    }
  };

  if (isLoading)
    return <div className="p-20 text-center text-[#929090]">Loading...</div>;
  if (!data) return null;

  const totalAmount = data.items.reduce(
    (sum: number, i: any) => sum + (Number(i.amount) || 0),
    0,
  );

  return (
    <div className="min-h-screen bg-[#F2F2F2] font-sans">
      <div className="mx-auto max-w-[1000px] px-6 py-10">
        <button
          onClick={() => router.back()}
          className="mb-6 inline-flex items-center gap-2 text-[13.5px] font-semibold text-[#929090] hover:text-[#111110]"
        >
          <ArrowLeft size={16} /> Back to Dashboard
        </button>

        <div className="mb-6 flex flex-wrap items-end justify-between gap-6 rounded-[14px] border border-black/[0.06] bg-white p-6 shadow-sm">
          <div>
            <div className="mb-2 flex items-center gap-2.5">
              <FileText size={20} className="text-[#FB4D27]" />
              <h1 className="text-[20px] font-bold text-[#111110]">
                {data.title}
              </h1>
            </div>
            <p className="text-[14px] text-[#929090]">
              Req #{data.id} · {data.department}
            </p>
          </div>
          <div className="text-right">
            <p className="text-[11px] font-semibold uppercase tracking-[0.06em] text-[#929090]">
              Est. Budget
            </p>
            <p className="font-mono text-[24px] font-bold text-[#111110]">
              ₹{totalAmount.toLocaleString("en-IN")}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 overflow-hidden rounded-[14px] border border-black/[0.06] bg-white shadow-sm">
            <div className="border-b border-black/[0.06] bg-[#FAFAFA] px-6 py-4">
              <h3 className="font-bold text-[#111110]">Requested Items</h3>
            </div>
            <div className="flex flex-col gap-4 p-6">
              {data.items.map((item: any, i: number) => (
                <div
                  key={item.id}
                  className="rounded-[10px] border border-black/5 bg-[#F9FAFB] p-4"
                >
                  <div className="mb-2 flex justify-between">
                    <span className="font-mono text-[11px] font-semibold text-[#929090]">
                      ITEM {i + 1}
                    </span>
                    <span className="font-mono text-[14px] font-bold text-[#111110]">
                      ₹{item.amount}
                    </span>
                  </div>
                  <h4 className="text-[14px] font-bold">{item.name}</h4>
                  <p className="mt-1 text-[12.5px] text-[#4C433F]">
                    {item.description}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <div className="rounded-[14px] border border-black/[0.06] bg-white p-6 shadow-sm">
              <h3 className="mb-4 font-bold text-[#111110]">Actions</h3>
              <button
                onClick={() => handleAction("FORWARD")}
                className="mb-3 flex w-full items-center justify-center gap-2 rounded-[9px] bg-[#111110] px-5 py-3 text-[13.5px] font-semibold text-white hover:bg-[#FB4D27]"
              >
                <Send size={15} /> Forward to Vendors
              </button>
              <button
                onClick={() => handleAction("REJECT")}
                className="flex w-full items-center justify-center gap-2 rounded-[9px] border-[1.5px] border-[#FF5F57]/30 bg-white px-5 py-3 text-[13.5px] font-semibold text-[#c53030] hover:bg-[#FF5F57]/5"
              >
                <XCircle size={15} /> Reject Request
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
