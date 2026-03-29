"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Users } from "lucide-react";

import { fetchResponses } from "../../utility/api";
import { VendorResponse } from "../../utility/index";

export default function ResponsesPage() {
  const router = useRouter();
  const [responses, setResponses] = useState<VendorResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadResponses = async () => {
      setIsLoading(true);
      const data = await fetchResponses();
      if (data) setResponses(data);
      setIsLoading(false);
    };
    loadResponses();
  }, []);

  const renderResponseStatusBadge = (status: VendorResponse["status"]) => {
    const styles = {
      PENDING_REVIEW: "bg-[#FFBD2E]/15 text-[#9a6e00] border-[#FFBD2E]/25",
      ACCEPTED: "bg-[#28CA41]/10 text-[#1a8c30] border-[#28CA41]/20",
      REJECTED: "bg-[#FF5F57]/10 text-[#c53030] border-[#FF5F57]/20",
    };
    return (
      <span
        className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.04em] ${styles[status] || styles.PENDING_REVIEW}`}
      >
        {status ? status.replace("_", " ") : "PENDING REVIEW"}
      </span>
    );
  };

  return (
    <div className="flex min-h-screen bg-[#F2F2F2] font-sans">
      <main className="flex-1 px-[clamp(20px,4vw,40px)] py-[clamp(24px,4vw,40px)] transition-[margin-left] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] max-md:ml-[68px]">
        {/* Header */}
        <div className="mb-7 flex items-center justify-between">
          <div>
            <h1 className="mb-0.5 text-[22px] font-bold tracking-[-0.03em] text-[#111110]">
              HOD Portal
            </h1>
            <p className="text-[13px] text-[#929090]">
              Head of Department — Computer Science
            </p>
          </div>
        </div>

        {/* Main Content */}
        <div className="overflow-hidden rounded-[14px] border border-black/[0.06] bg-white p-6 shadow-sm">
          <div className="mb-5 flex items-center justify-between">
            <span className="text-[16px] font-bold text-[#111110]">
              Vendor Responses
            </span>
          </div>

          <div className="overflow-x-auto rounded-[10px] border border-black/5 bg-white">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-16 text-[#929090]">
                <div className="mb-4 h-8 w-8 animate-spin rounded-full border-[3px] border-[#5B7FA6] border-r-transparent" />
                <p className="text-[13px] font-medium">Loading responses...</p>
              </div>
            ) : responses.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-14 text-center">
                <div className="mb-[14px] flex h-[52px] w-[52px] items-center justify-center rounded-[14px] bg-[#F2F2F2]">
                  <Users size={22} color="#D3D6DA" />
                </div>
                <h3 className="mb-1 text-[14px] font-bold text-[#111110]">
                  No vendor responses yet
                </h3>
                <p className="text-[13px] text-[#929090]">
                  Responses will appear here once vendors submit their
                  quotations.
                </p>
              </div>
            ) : (
              <table className="w-full text-left">
                <thead className="bg-[#F2F2F2] font-mono text-[10px] font-semibold uppercase tracking-[0.06em] text-[#929090]">
                  <tr>
                    <th className="px-4 py-3.5 whitespace-nowrap">
                      Vendor & Quotation
                    </th>
                    <th className="px-4 py-3.5 whitespace-nowrap">
                      Items Offered
                    </th>
                    <th className="px-4 py-3.5 whitespace-nowrap">
                      Base Total
                    </th>
                    <th className="px-4 py-3.5 whitespace-nowrap">Status</th>
                    <th className="px-4 py-3.5 text-right whitespace-nowrap">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-black/5">
                  {responses.map((res) => {
                    const baseTotal =
                      res.response_items?.reduce(
                        (sum, item) => sum + (item.unit_price || 0),
                        0,
                      ) || 0;
                    const maxDays = Math.max(
                      ...(res.response_items?.map(
                        (i) => parseInt(i.delivery_period?.split(" ")[0]) || 0,
                      ) || [0]),
                    );

                    return (
                      <tr
                        key={res.id}
                        className="transition-colors hover:bg-black/[0.02]"
                      >
                        <td className="px-4 py-3.5">
                          <div className="flex flex-col">
                            <span className="text-[13.5px] font-semibold text-[#111110]">
                              {res.vendor_name || `Vendor ID: ${res.vendor}`}
                            </span>
                            <span className="mt-0.5 text-[11px] text-[#929090]">
                              Req #{res.quotation}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3.5">
                          <div className="flex flex-col">
                            <span className="text-[13px] text-[#4C433F]">
                              {res.response_items?.length || 0} item(s) included
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3.5">
                          <div className="flex flex-col">
                            <span className="font-mono text-[13px] font-medium text-[#111110]">
                              ₹{baseTotal.toLocaleString("en-IN")}
                            </span>
                            <span className="mt-0.5 text-[11px] text-[#929090]">
                              {maxDays > 0
                                ? `${maxDays} days delivery`
                                : "N/A delivery"}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3.5">
                          {renderResponseStatusBadge(
                            res.status || "PENDING_REVIEW",
                          )}
                        </td>
                        <td className="px-4 py-3.5 text-right">
                          <button
                            className="text-[13px] font-semibold text-[#5B7FA6] hover:underline"
                            onClick={() =>
                              router.push(`/hod/qt/${res.quotation}/compare`)
                            }
                          >
                            Compare Bids
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
