"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { FileText, Users, ShieldCheck, Plus, CheckCircle2, Clock, XCircle, Package } from "lucide-react";
import { Sidebar } from "@/app/components/Sidebar";
import { fetchQuotations } from "../../utility/api";
import { Quotation } from "../../utility/index";

export default function QuotationsPage() {
  const router = useRouter();
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadQuotations = async () => {
      setIsLoading(true);
      const data = await fetchQuotations();
      if (data) setQuotations(data);
      setIsLoading(false);
    };
    loadQuotations();
  }, []);

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
      <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.04em] ${styles[status] || styles.PENDING}`}>
        {icons[status] || icons.PENDING}
        {status}
      </span>
    );
  };

  return (
    <div className="flex min-h-screen bg-[#F2F2F2] font-sans">
  
      <main className="flex-1 px-[clamp(20px,4vw,40px)] py-[clamp(24px,4vw,40px)] transition-[margin-left] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] max-md:ml-[68px]">
        
        {/* Header */}
        <div className="mb-7 flex items-center justify-between">
          <div>
            <h1 className="mb-0.5 text-[22px] font-bold tracking-[-0.03em] text-[#111110]">HOD Portal</h1>
            <p className="text-[13px] text-[#929090]">Head of Department — Computer Science</p>
          </div>
          <button
            className="inline-flex items-center gap-[7px] rounded-[9px] bg-[#111110] px-[18px] py-[9px] text-[13.5px] font-semibold text-white transition-all duration-200 hover:-translate-y-[1px] hover:bg-[#FB4D27]"
            onClick={() => router.push("/hod/quotations/new")}
          >
            <Plus size={15} /> New request
          </button>
        </div>

        {/* Stats */}
        <div className="mb-6 grid grid-cols-1 gap-3 md:grid-cols-3">
          {[
            { label: "Active Requests", val: "3", sub: "2 pending review", color: "#FB4D27", bg: "bg-[#FB4D27]/[0.08]", icon: <FileText size={15} color="#FB4D27" /> },
            { label: "Vendor Responses", val: "6", sub: "4 new since last login", color: "#5B7FA6", bg: "bg-[#5B7FA6]/10", icon: <Users size={15} color="#5B7FA6" /> },
            { label: "Approved This Month", val: "2", sub: "₹14,500 total value", color: "#28CA41", bg: "bg-[#28CA41]/10", icon: <ShieldCheck size={15} color="#28CA41" /> },
          ].map((s, i) => (
            <div key={i} className="rounded-xl border border-black/[0.06] bg-white p-5 pb-4 shadow-sm hover:shadow-md transition-shadow">
              <div className="mb-3 flex items-center justify-between">
                <span className="text-[12px] font-medium uppercase tracking-[0.06em] text-[#929090]">{s.label}</span>
                <div className={`flex h-[30px] w-[30px] items-center justify-center rounded-lg ${s.bg}`}>{s.icon}</div>
              </div>
              <div className="mb-1 font-sans text-[28px] font-bold tracking-[-0.04em]" style={{ color: s.color }}>{s.val}</div>
              <div className="text-[11px] text-[#929090]">{s.sub}</div>
            </div>
          ))}
        </div>

        {/* Main Content */}
        <div className="overflow-hidden rounded-[14px] border border-black/[0.06] bg-white p-6 shadow-sm">
          <div className="mb-5 flex items-center justify-between">
            <span className="text-[16px] font-bold text-[#111110]">All Quotation Requests</span>
          </div>

          <div className="overflow-x-auto rounded-[10px] border border-black/5">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-16 text-[#929090]">
                <div className="mb-4 h-8 w-8 animate-spin rounded-full border-[3px] border-[#FB4D27] border-r-transparent" />
                <p className="text-[13px] font-medium">Loading quotations...</p>
              </div>
            ) : quotations.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-14 text-center">
                <div className="mb-[14px] flex h-[52px] w-[52px] items-center justify-center rounded-[14px] bg-[#F2F2F2]">
                  <FileText size={22} color="#D3D6DA" />
                </div>
                <h3 className="mb-1 text-[14px] font-bold text-[#111110]">No quotations found</h3>
                <p className="text-[13px] text-[#929090]">You haven't created any quotation requests yet.</p>
              </div>
            ) : (
              <table className="w-full text-left">
                <thead className="bg-[#F2F2F2] font-mono text-[10px] font-semibold uppercase tracking-[0.06em] text-[#929090]">
                  <tr>
                    <th className="px-4 py-3.5 whitespace-nowrap">Quotation details</th>
                    <th className="px-4 py-3.5 whitespace-nowrap">Category / Dept</th>
                    <th className="px-4 py-3.5 whitespace-nowrap">Deadline</th>
                    <th className="px-4 py-3.5 whitespace-nowrap">Status</th>
                    <th className="px-4 py-3.5 text-right whitespace-nowrap">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-black/5">
                  {quotations.map((qt) => (
                    <tr key={qt.id} className="transition-colors hover:bg-black/[0.02]">
                      <td className="px-4 py-3.5">
                        <div className="flex flex-col">
                          <span className="text-[13.5px] font-semibold text-[#111110]">{qt.title}</span>
                          <span className="mt-0.5 font-mono text-[11px] text-[#929090]">#{qt.id} · {qt.delivery_period}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="flex flex-col">
                          <span className="text-[13px] text-[#4C433F]">{qt.category}</span>
                          <span className="text-[11px] text-[#929090]">{qt.department}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className="text-[13px] text-[#4C433F]">
                          {new Date(qt.submission_deadline).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                        </span>
                      </td>
                      <td className="px-4 py-3.5">
                        {renderStatusBadge(qt.status)}
                      </td>
                      <td className="px-4 py-3.5 text-right">
                        <button
                          className="text-[13px] font-semibold text-[#FB4D27] hover:underline"
                          onClick={() => router.push(`/hod/qt/${qt.id}`)}
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}