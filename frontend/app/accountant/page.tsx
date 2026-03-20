// app/accountant/page.tsx
"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { RefreshCw, Send, CheckCircle, XCircle } from "lucide-react";
import { BACKEND_URL, Quotation } from "../utility";

export default function Page() {
  const [incoming, setIncoming] = useState<Quotation[]>([]);
  const [finalQueue, setFinalQueue] = useState<Quotation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      try {
        const { data } = await axios.get(`${BACKEND_URL}/qt/`, {
          headers: { "Content-Type": "application/json" },
        });
        const mapped: Quotation[] = data.map((d: any) => ({
          id: d.id,
          category: d.category,
          quotationTitle: d.title,
          description: d.description,
          department: d.department,
          submissionDeadline: d.submission_deadline,
          deliveryPeriod: d.delivery_period,
          status: d.status,
          qtReqVerifiedAccountant: d.qt_req_verified_accountant,
          finalQtVerifiedAccountant: d.final_qt_verified_accountant,
          qtVerifiedPrincipal: d.qt_verified_principal,
          items: d.items.map((item: any) => ({
            id: item.id,
            itemName: item.name,
            itemDescription: item.description,
            amount: item.amount,
          })),
        }));

        setIncoming(mapped.filter((q) => !q.qtReqVerifiedAccountant));
        setFinalQueue(
          mapped.filter(
            (q) => q.qtReqVerifiedAccountant && !q.finalQtVerifiedAccountant,
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

  const forwardToVendors = async (id: string) => {
    try {
      await axios.patch(
        `${BACKEND_URL}/qt/${id}`,
        { qt_req_verified_accountant: true },
        { headers: { "Content-Type": "application/json" } },
      );
      setIncoming((prev) => prev.filter((q) => q.id !== id));
    } catch {
      console.error("Failed to forward");
    }
  };

  const sendToPrincipal = async (id: string) => {
    try {
      await axios.patch(
        `${BACKEND_URL}/qt/${id}`,
        { final_qt_verified_accountant: true },
        { headers: { "Content-Type": "application/json" } },
      );
      setFinalQueue((prev) => prev.filter((q) => q.id !== id));
    } catch {
      console.error("Failed to send to principal");
    }
  };

  const statusBadge = (q: Quotation) => {
    if (q.qtVerifiedPrincipal)
      return (
        <span className="text-xs px-2.5 py-1 rounded-full bg-green-100 text-green-700 font-medium">
          Principal approved
        </span>
      );
    if (q.finalQtVerifiedAccountant)
      return (
        <span className="text-xs px-2.5 py-1 rounded-full bg-blue-100 text-blue-700 font-medium">
          Sent to principal
        </span>
      );
    if (q.qtReqVerifiedAccountant)
      return (
        <span className="text-xs px-2.5 py-1 rounded-full bg-yellow-100 text-yellow-700 font-medium">
          Forwarded to vendors
        </span>
      );
    return (
      <span className="text-xs px-2.5 py-1 rounded-full bg-gray-100 text-gray-600 font-medium">
        Pending review
      </span>
    );
  };

  const metrics = [
    { label: "Pending review", value: incoming.length, sub: "from HOD" },
    {
      label: "Forwarded to vendors",
      value: finalQueue.length,
      sub: "awaiting responses",
      color: "text-blue-600",
    },
    {
      label: "Final verification",
      value: finalQueue.length,
      sub: "ready for principal",
      color: "text-green-600",
    },
  ];

  return (
    <div className="min-h-screen bg-slate-100 font-sans">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Top bar */}
        <div className="bg-white rounded-lg shadow-lg px-6 py-4 flex items-center justify-between mb-6">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-semibold text-gray-800">
                Accountant workspace
              </h1>
              <span className="text-xs px-2.5 py-1 rounded-full bg-yellow-100 text-yellow-700 font-medium">
                Accountant
              </span>
            </div>
            <p className="text-gray-500 text-sm mt-0.5">
              Manage incoming quotation requests and final verifications
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-600">Priya Menon</span>
            <div className="w-9 h-9 rounded-full bg-yellow-100 flex items-center justify-center text-sm font-medium text-yellow-700">
              PM
            </div>
          </div>
        </div>

        {/* Metrics */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          {metrics.map((m) => (
            <div
              key={m.label}
              className="bg-white rounded-lg shadow-lg px-5 py-4"
            >
              <p className="text-gray-500 text-xs mb-1">{m.label}</p>
              <p
                className={`text-3xl font-light ${m.color ?? "text-gray-800"}`}
              >
                {m.value}
              </p>
              <p className="text-gray-400 text-xs mt-1">{m.sub}</p>
            </div>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <RefreshCw className="w-5 h-5 text-gray-400 animate-spin" />
          </div>
        ) : (
          <>
            {/* Section 1 — Incoming from HOD */}
            <div className="bg-white rounded-lg shadow-lg overflow-hidden mb-6">
              <div className="px-6 py-4 border-b border-gray-200 flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-yellow-100 flex items-center justify-center text-xs font-medium text-yellow-700">
                  1
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-800">
                    Incoming quotation requests
                  </p>
                  <p className="text-xs text-gray-500">
                    Verify HOD requests and forward to vendors
                  </p>
                </div>
              </div>

              <div className="px-6 py-5 space-y-3">
                {incoming.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-10 text-center">
                    <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center mb-2">
                      <CheckCircle className="w-4 h-4 text-gray-400" />
                    </div>
                    <p className="text-gray-500 text-sm">All caught up.</p>
                    <p className="text-gray-400 text-xs mt-1">
                      No pending requests from HOD.
                    </p>
                  </div>
                ) : (
                  incoming.map((q) => (
                    <div
                      key={q.id}
                      className="border border-gray-200 rounded-lg p-4 bg-slate-50 hover:border-yellow-300 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-sm font-medium text-gray-800">
                            {q.quotationTitle}
                          </p>
                          <p className="text-xs text-gray-500 mt-0.5">
                            {q.department} · {q.category} · Deadline:{" "}
                            {q.submissionDeadline?.slice(0, 10)}
                          </p>
                        </div>
                        {statusBadge(q)}
                      </div>

                      <div className="flex flex-wrap gap-2 mt-3">
                        {q.items.map((item) => (
                          <span
                            key={item.id}
                            className="text-xs bg-white border border-gray-200 rounded-md px-2 py-1 text-gray-600"
                          >
                            {item.itemName} × {item.amount}
                          </span>
                        ))}
                      </div>

                      <div className="flex gap-2 mt-3 pt-3 border-t border-gray-200">
                        <button
                          onClick={() => forwardToVendors(q.id)}
                          className="flex items-center gap-1.5 px-3 py-1.5 text-xs border border-blue-200 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
                        >
                          <Send className="w-3 h-3" />
                          Forward to vendors
                        </button>
                        <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs border border-red-200 text-red-500 rounded-lg hover:bg-red-50 transition-colors">
                          <XCircle className="w-3 h-3" />
                          Reject
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Section 2 — Final verification */}
            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center text-xs font-medium text-green-700">
                  2
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-800">
                    Final verification queue
                  </p>
                  <p className="text-xs text-gray-500">
                    HOD-selected responses — verify and forward to principal
                  </p>
                </div>
              </div>

              <div className="px-6 py-5 space-y-3">
                {finalQueue.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-10 text-center">
                    <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center mb-2">
                      <Send className="w-4 h-4 text-gray-400" />
                    </div>
                    <p className="text-gray-500 text-sm">
                      Nothing to verify yet.
                    </p>
                    <p className="text-gray-400 text-xs mt-1">
                      Items selected by HOD will appear here.
                    </p>
                  </div>
                ) : (
                  finalQueue.map((q) => (
                    <div
                      key={q.id}
                      className="border border-gray-200 rounded-lg p-4 bg-slate-50 hover:border-green-300 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-sm font-medium text-gray-800">
                            {q.quotationTitle}
                          </p>
                          <p className="text-xs text-gray-500 mt-0.5">
                            {q.department} · HOD selected · Quotation #{q.id}
                          </p>
                        </div>
                        {statusBadge(q)}
                      </div>

                      <div className="flex flex-wrap gap-2 mt-3">
                        {q.items.map((item) => (
                          <span
                            key={item.id}
                            className="text-xs bg-white border border-gray-200 rounded-md px-2 py-1 text-gray-600"
                          >
                            {item.itemName} × {item.amount}
                          </span>
                        ))}
                      </div>

                      <div className="flex gap-2 mt-3 pt-3 border-t border-gray-200">
                        <button
                          onClick={() => sendToPrincipal(q.id)}
                          className="flex items-center gap-1.5 px-3 py-1.5 text-xs border border-green-200 text-green-600 rounded-lg hover:bg-green-50 transition-colors"
                        >
                          <CheckCircle className="w-3 h-3" />
                          Send to principal
                        </button>
                        <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs border border-red-200 text-red-500 rounded-lg hover:bg-red-50 transition-colors">
                          <XCircle className="w-3 h-3" />
                          Reject
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
