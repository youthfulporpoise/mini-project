"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import {
  Send,
  CheckCircle2,
  Clock,
  ShieldCheck,
  ArrowRight,
  Eye,
  FileText,
} from "lucide-react";
import { BACKEND_URL } from "../utility";
import { Quotation } from "../utility/index";
import { fetchQuotations } from "../utility/api";

export default function AccountantDashboard() {
  const router = useRouter();
  const [incoming, setIncoming] = useState<Quotation[]>([]);
  const [finalQueue, setFinalQueue] = useState<Quotation[]>([]);
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<any>(null);

  useEffect(() => {
    // 1. Fetch User Profile
    try {
      const cookieData = Cookies.get("userProfile");
      if (cookieData) {
        setUserProfile(JSON.parse(decodeURIComponent(cookieData)));
      }
    } catch (e) {
      console.error("Failed to parse user profile cookie", e);
    }

    // 2. Fetch Data
    const fetchAll = async () => {
      setLoading(true);
      try {
        const data = await fetchQuotations();
        const mapped: Quotation[] = data.map((d: any) => ({
          ...d,
          quotationTitle: d.title,
          submissionDeadline: d.submission_deadline,
          deliveryPeriod: d.delivery_period,
          qtReqVerifiedAccountant: d.qt_req_verified_accountant,
          finalQtVerifiedAccountant: d.final_qt_verified_accountant,
          qtVerifiedPrincipal: d.qt_verified_principal,
        }));

        // Queue 1: Needs to be forwarded to vendors
        setIncoming(
          mapped.filter(
            (q) => !q.qtReqVerifiedAccountant && q.status !== "REJECTED",
          ),
        );

        // Queue 2: HOD Approved a vendor, needs Principal forwarding
        setFinalQueue(
          mapped.filter(
            (q) =>
              q.qtReqVerifiedAccountant &&
              !q.finalQtVerifiedAccountant &&
              q.status === "DELIVERED",
          ),
        );
      } catch {
        console.error("Failed to fetch quotations");
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  const metrics = [
    {
      label: "Pending Review",
      value: incoming.length,
      sub: "Requests from HOD",
      color: "#FFBD2E",
      bg: "bg-[#FFBD2E]/15",
      icon: <Clock size={16} className="text-[#9a6e00]" />,
    },
    {
      label: "Forwarded to Vendors",
      value: finalQueue.length,
      sub: "Awaiting final review",
      color: "#5B7FA6",
      bg: "bg-[#5B7FA6]/10",
      icon: <Send size={16} className="text-[#5B7FA6]" />,
    },
    {
      label: "Ready for Principal",
      value: finalQueue.length,
      sub: "Final verification queue",
      color: "#28CA41",
      bg: "bg-[#28CA41]/10",
      icon: <ShieldCheck size={16} className="text-[#28CA41]" />,
    },
  ];

  return (
    <div className="min-h-screen bg-[#F2F2F2] font-sans text-[#111110]">
      <div className="mx-auto max-w-[1400px] px-[clamp(16px,4vw,32px)] py-[clamp(24px,4vw,40px)]">
        {/* ── Top Header ── */}
        <div className="mb-8 flex items-center justify-between rounded-[14px] border border-black/[0.06] bg-white p-6 shadow-sm">
          <div>
            <div className="mb-1 flex items-center gap-3">
              <h1 className="text-[22px] font-bold tracking-[-0.03em] text-[#111110]">
                Accountant Workspace
              </h1>
              <span className="rounded-full bg-[#111110] px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.06em] text-white">
                {userProfile?.role || "ACCOUNTANT"}
              </span>
            </div>
            <p className="text-[13.5px] text-[#929090]">
              Verify incoming requests and execute final compliance checks.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-[13px] font-bold text-[#111110] capitalize">
                {userProfile?.name || "Accountant User"}
              </p>
              <p className="font-mono text-[11px] text-[#929090]">
                {userProfile?.email || "ACCT-001"}
              </p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-[#111110] to-[#4C433F] text-[14px] font-bold uppercase text-white shadow-sm">
              {userProfile?.name ? userProfile.name.charAt(0) : "A"}
            </div>
          </div>
        </div>

        {/* ── Metrics ── */}
        <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
          {metrics.map((m) => (
            <div
              key={m.label}
              className="rounded-[14px] border border-black/[0.06] bg-white p-5 shadow-sm"
            >
              <div className="mb-3 flex items-center justify-between">
                <span className="text-[11px] font-semibold uppercase tracking-[0.06em] text-[#929090]">
                  {m.label}
                </span>
                <div
                  className={`flex h-[32px] w-[32px] items-center justify-center rounded-lg ${m.bg}`}
                >
                  {m.icon}
                </div>
              </div>
              <p className="font-mono text-[32px] font-bold tracking-tight text-[#111110]">
                {m.value}
              </p>
              <p className="mt-0.5 text-[12px] text-[#929090]">{m.sub}</p>
            </div>
          ))}
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-[#929090]">
            <div className="mb-4 h-8 w-8 animate-spin rounded-full border-[3px] border-[#111110] border-r-transparent" />
            <p className="text-[13px] font-medium">
              Syncing accounting records...
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-2">
            {/* COLUMN 1: Incoming from HOD */}
            <div className="overflow-hidden rounded-[14px] border border-black/[0.06] bg-white shadow-sm">
              <div className="flex items-center gap-3 border-b border-black/[0.06] bg-[#FAFAFA] px-6 py-4">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-[#FFBD2E]/20 text-[13px] font-bold text-[#9a6e00]">
                  1
                </div>
                <div>
                  <h3 className="text-[15px] font-bold text-[#111110]">
                    Incoming Requests
                  </h3>
                  <p className="text-[12px] text-[#929090]">
                    Verify requirements and forward to vendors.
                  </p>
                </div>
              </div>

              <div className="flex flex-col gap-4 bg-white p-5">
                {incoming.length === 0 ? (
                  <div className="py-12 text-center">
                    <CheckCircle2
                      size={28}
                      className="mx-auto mb-3 text-[#D3D6DA]"
                    />
                    <p className="text-[14px] font-bold text-[#111110]">
                      All caught up.
                    </p>
                  </div>
                ) : (
                  incoming.map((q) => (
                    <div
                      key={q.id}
                      className="rounded-[12px] border border-black/10 bg-[#FAFAFA] p-5 transition-colors hover:border-[#FFBD2E]/50 hover:bg-white"
                    >
                      <div className="mb-4">
                        <h4 className="text-[15px] font-bold text-[#111110]">
                          {q.quotationTitle || q.title}
                        </h4>
                        <p className="mt-1 text-[12px] text-[#929090]">
                          Req <span className="font-mono">#{q.id}</span> ·{" "}
                          {q.department}
                        </p>
                      </div>
                      <button
                        onClick={() => router.push(`/accountant/qt/${q.id}`)}
                        className="flex w-full items-center justify-between rounded-[8px] bg-white px-4 py-3 border border-black/5 text-[13px] font-semibold text-[#111110] transition-colors hover:border-[#111110]"
                      >
                        <span className="flex items-center gap-2">
                          <Eye size={15} /> Review & Forward to Vendors
                        </span>
                        <ArrowRight size={15} className="text-[#929090]" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* COLUMN 2: Final Verification */}
            <div className="overflow-hidden rounded-[14px] border border-black/[0.06] bg-white shadow-sm">
              <div className="flex items-center gap-3 border-b border-black/[0.06] bg-[#FAFAFA] px-6 py-4">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-[#28CA41]/20 text-[13px] font-bold text-[#1a8c30]">
                  2
                </div>
                <div>
                  <h3 className="text-[15px] font-bold text-[#111110]">
                    Final Verification Queue
                  </h3>
                  <p className="text-[12px] text-[#929090]">
                    HOD-approved vendor quotes for Principal.
                  </p>
                </div>
              </div>

              <div className="flex flex-col gap-4 bg-white p-5">
                {finalQueue.length === 0 ? (
                  <div className="py-12 text-center">
                    <ShieldCheck
                      size={28}
                      className="mx-auto mb-3 text-[#D3D6DA]"
                    />
                    <p className="text-[14px] font-bold text-[#111110]">
                      Nothing to verify yet.
                    </p>
                  </div>
                ) : (
                  finalQueue.map((q) => (
                    <div
                      key={q.id}
                      className="rounded-[12px] border border-black/10 bg-[#FAFAFA] p-5 transition-colors hover:border-[#28CA41]/50 hover:bg-white"
                    >
                      <div className="mb-4">
                        <h4 className="text-[15px] font-bold text-[#111110]">
                          {q.quotationTitle || q.title}
                        </h4>
                        <p className="mt-1 flex items-center gap-2 text-[12px] text-[#929090]">
                          Req <span className="font-mono">#{q.id}</span> ·{" "}
                          {q.department}
                          <span className="rounded bg-[#FB4D27]/10 px-1.5 py-0.5 text-[10px] font-bold uppercase text-[#FB4D27]">
                            HOD Approved
                          </span>
                        </p>
                      </div>
                      <button
                        onClick={() =>
                          router.push(`/accountant/verify/${q.id}`)
                        }
                        className="flex w-full items-center justify-between rounded-[8px] bg-white px-4 py-3 border border-black/5 text-[13px] font-semibold text-[#111110] transition-colors hover:border-[#28CA41]"
                      >
                        <span className="flex items-center gap-2">
                          <ShieldCheck size={15} /> Review Compliance & Forward
                        </span>
                        <ArrowRight size={15} className="text-[#929090]" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
