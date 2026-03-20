// app/hod/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FileText, Users } from "lucide-react";
import { QtResponses } from "../components/QtResponse";

const metrics = [
  { label: "Total quotations", value: 0, sub: "raised by you" },
  {
    label: "Open",
    value: 0,
    sub: "awaiting responses",
    color: "text-blue-600",
  },
  { label: "Responses received", value: 0, sub: "from vendors" },
  { label: "Accepted", value: 0, sub: "quotations", color: "text-green-600" },
];

export default function HODPage() {
  const [activeTab, setActiveTab] = useState<"quotations" | "responses">(
    "quotations",
  );
  const router = useRouter();

  return (
    <div className="min-h-screen bg-slate-100 font-sans">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Top bar */}
        <div className="bg-white rounded-lg shadow-lg px-6 py-4 flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-semibold text-gray-800">HOD Portal</h1>
            <p className="text-gray-500 text-sm mt-0.5">
              Head of Department — Computer Science
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden mb-6">
          <div className="flex border-b border-gray-200">
            {(["quotations", "responses"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-3 text-sm font-medium transition-colors border-b-2 -mb-px ${
                  activeTab === tab
                    ? "border-blue-600 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                {tab === "quotations" ? "My quotations" : "Vendor responses"}
              </button>
            ))}
          </div>

          <div className="px-6 py-5">
            {/* Quotations tab */}
            {activeTab === "quotations" && (
              <>
                <div className="flex items-center justify-between mb-5">
                  <h2 className="text-sm font-medium text-gray-700">
                    Quotation requests
                  </h2>
                  <button
                    onClick={() => router.push("/hod/quotations/new")}
                    className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                  >
                    <FileText className="w-4 h-4" />
                    New request
                  </button>
                </div>

                <QtResponses />
              </>
            )}

            {/* Responses tab */}
            {activeTab === "responses" && (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mb-3">
                  <Users className="w-5 h-5 text-gray-400" />
                </div>
                <p className="text-gray-500 text-sm">
                  No vendor responses yet.
                </p>
                <p className="text-gray-400 text-xs mt-1">
                  Responses will appear here once vendors submit.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
