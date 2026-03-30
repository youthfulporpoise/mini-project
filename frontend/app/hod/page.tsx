"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  FileText,
  Users,
  ShieldCheck,
  Plus,
  Clock,
  CheckCircle2,
  XCircle,
  Package,
  ArrowRight,
} from "lucide-react";
import { fetchQuotations, fetchResponses } from "../utility/api";
import { Quotation, VendorResponse } from "../utility/index";



export default function HodOverviewDashboard() {
  const router = useRouter();

  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [responses, setResponses] = useState<VendorResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch data to populate the dashboard stats and recent lists
  useEffect(() => {
    const fetchDashboardData = async () => {
      setIsLoading(true);
      try {
        const [qtData, resData] = await Promise.all([
          fetchQuotations(),
          fetchResponses(),
        ]);
        const sortedQt = qtData.sort((a, b) => b.id - a.id);
        const sortedRes = resData.sort((a, b) => b.id - a.id);
        if (sortedQt) setQuotations(sortedQt);
        if (sortedRes) setResponses(sortedRes);
        
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  // Helper for Quotation Badges
  const renderStatusBadge = (status: Quotation["status"]) => {
    const styles = {
      APPROVED: "bg-[#28CA41]/10 text-[#1a8c30] border-[#28CA41]/20",
      PENDING: "bg-[#FFBD2E]/15 text-[#9a6e00] border-[#FFBD2E]/25",
      REJECTED: "bg-[#FF5F57]/10 text-[#c53030] border-[#FF5F57]/20",
      DELIVERED: "bg-[#5B7FA6]/10 text-[#5B7FA6] border-[#5B7FA6]/20",
    };
    const icons = {
      APPROVED: <CheckCircle2 size={12} className="mr-1" />,
      PENDING: <Clock size={12} className="mr-1" />,
      REJECTED: <XCircle size={12} className="mr-1" />,
      DELIVERED: <Package size={12} className="mr-1" />,
    };

    return (
      <span
        className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[9px] font-semibold uppercase tracking-[0.04em] ${styles[status] || styles.PENDING}`}
      >
        {icons[status] || icons.PENDING}
        {status}
      </span>
    );
  };

  
  // Get top 4 recent items to display on the dashboard
  const recentQuotations = quotations.slice(0, 5);
  const recentResponses = responses.slice(0, 5);

  return (
    <div className="flex min-h-screen bg-[#F2F2F2] font-sans">
      <main className="flex-1 px-[clamp(20px,4vw,40px)] py-[clamp(24px,4vw,40px)] transition-[margin-left] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] max-md:ml-[68px]">
        {/* ── Header ── */}
        <div className="mb-7 flex items-center justify-between">
          <div>
            <h1 className="mb-0.5 text-[22px] font-bold tracking-[-0.03em] text-[#111110]">
              Dashboard Overview
            </h1>
            <p className="text-[13px] text-[#929090]">
              Head of Department — Computer Science
            </p>
          </div>
          <button
            className="inline-flex items-center gap-[7px] rounded-[9px] bg-[#111110] px-[18px] py-[9px] text-[13.5px] font-semibold text-white transition-all duration-200 hover:-translate-y-[1px] hover:bg-[#FB4D27] active:translate-y-0"
            onClick={() => router.push("/hod/quotations/new")} // Assuming you have a new request route
          >
            <Plus size={15} />
            New Request
          </button>
        </div>

        {/* ── Stat Strip ── */}
        <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3">
          {[
            {
              label: "Active Requests",
              val: quotations.length.toString(),
              sub: "Total quotation requests",
              color: "#FB4D27",
              bg: "bg-[#FB4D27]/[0.08]",
              icon: <FileText size={15} color="#FB4D27" />,
            },
            {
              label: "Vendor Responses",
              val: responses.length.toString(),
              sub: "Waiting for review",
              color: "#5B7FA6",
              bg: "bg-[#5B7FA6]/10",
              icon: <Users size={15} color="#5B7FA6" />,
            },
            {
              label: "Pending Deliveries",
              val: "0", // Replace with dynamic data if available
              sub: "Awaiting OTP Verification",
              color: "#28CA41",
              bg: "bg-[#28CA41]/10",
              icon: <ShieldCheck size={15} color="#28CA41" />,
            },
          ].map((s, i) => (
            <div
              key={i}
              className="rounded-[14px] border border-black/[0.06] bg-white p-5 pb-4 shadow-sm transition-shadow duration-200 hover:shadow-md"
            >
              <div className="mb-3 flex items-center justify-between">
                <span className="text-[12px] font-medium uppercase tracking-[0.06em] text-[#929090]">
                  {s.label}
                </span>
                <div
                  className={`flex h-[30px] w-[30px] items-center justify-center rounded-lg ${s.bg}`}
                >
                  {s.icon}
                </div>
              </div>
              <div
                className="mb-1 font-sans text-[28px] font-bold leading-none tracking-[-0.04em]"
                style={{ color: s.color }}
              >
                {s.val}
              </div>
              <div className="text-[11px] text-[#929090]">{s.sub}</div>
            </div>
          ))}
        </div>

        {/* ── Quick Activity Panels ── */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Panel 1: Recent Quotations */}
          <div className="flex flex-col overflow-hidden rounded-[14px] border border-black/[0.06] bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-black/[0.06] bg-[#FAFAFA] px-5 py-4">
              <h3 className="text-[15px] font-bold text-[#111110]">
                Recent Quotations
              </h3>
              <button
                onClick={() => router.push("/hod/quotations")}
                className="text-[12px] font-semibold text-[#FB4D27] hover:underline"
              >
                View all
              </button>
            </div>
            <div className="flex flex-col p-2">
              {isLoading ? (
                <div className="py-10 text-center text-[13px] text-[#929090]">
                  Loading...
                </div>
              ) : recentQuotations.length === 0 ? (
                <div className="py-10 text-center text-[13px] text-[#929090]">
                  No quotations found.
                </div>
              ) : (
                recentQuotations.map((qt) => (
                  <div
                    key={qt.id}
                    className="flex items-center justify-between rounded-[10px] p-3 transition-colors hover:bg-[#F2F2F2]"
                  >
                    <div className="flex flex-col">
                      <span className="text-[13.5px] font-semibold text-[#111110]">
                        {qt.title}
                      </span>
                      <span className="font-mono text-[11px] text-[#929090]">
                        #{qt.id} · {qt.department}
                      </span>
                    </div>
                    <div className="flex items-center gap-4">
                      {renderStatusBadge(qt.status)}
                      <button
                        onClick={() => router.push(`/hod/qt/${qt.id}`)}
                        className="text-[#929090] hover:text-[#111110]"
                      >
                        <ArrowRight size={16} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Panel 2: Recent Vendor Responses */}
          <div className="flex flex-col overflow-hidden rounded-[14px] border border-black/[0.06] bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-black/[0.06] bg-[#FAFAFA] px-5 py-4">
              <h3 className="text-[15px] font-bold text-[#111110]">
                New Vendor Responses
              </h3>
              <button
                onClick={() => router.push("/hod/responses")}
                className="text-[12px] font-semibold text-[#5B7FA6] hover:underline"
              >
                View all
              </button>
            </div>
            <div className="flex flex-col p-2">
              {isLoading ? (
                <div className="py-10 text-center text-[13px] text-[#929090]">
                  Loading...
                </div>
              ) : recentResponses.length === 0 ? (
                <div className="py-10 text-center text-[13px] text-[#929090]">
                  No vendor responses yet.
                </div>
              ) : (
                recentResponses.map((res) => {
                  const baseTotal =
                    res.response_items?.reduce(
                      (sum, item) => sum + (item.unit_price || 0),
                      0,
                    ) || 0;
                  return (
                    <div
                      key={res.id}
                      className="flex items-center justify-between rounded-[10px] p-3 transition-colors hover:bg-[#F2F2F2]"
                    >
                      <div className="flex flex-col">
                        <span className="text-[13.5px] font-semibold text-[#111110]">
                          {res.vendor_name || `Vendor ID: ${res.vendor}`}
                        </span>
                        <span className="text-[11px] text-[#929090]">
                          For Quotation #{res.quotation}
                        </span>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="font-mono text-[13px] font-bold text-[#111110]">
                          ₹{baseTotal.toLocaleString("en-IN")}
                        </span>
                        <button
                          onClick={() =>
                            router.push(`/hod/qt/${res.quotation}/compare`)
                          }
                          className="rounded bg-[#5B7FA6]/10 px-2.5 py-1 text-[11px] font-semibold text-[#5B7FA6] hover:bg-[#5B7FA6] hover:text-white transition-colors"
                        >
                          Review
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
