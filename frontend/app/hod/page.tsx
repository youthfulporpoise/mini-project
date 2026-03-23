"use client";

import {
  useState,
  useRef,
  useEffect,
  KeyboardEvent,
  ClipboardEvent,
} from "react";
import { useRouter } from "next/navigation";
import { FileText, Users } from "lucide-react";
import axios from "axios";
import { QtResponses } from "../components/QtResponse";
import { BACKEND_URL } from "../utility";
import Cookies from "js-cookie";
// ─── OTP Component ────────────────────────────────────────────────────────────

function OtpVerify({ quotationId }: { quotationId: string }) {
  const [digits, setDigits] = useState<string[]>(
    Array.from({ length: 6 }, () => ""),
  );
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [requesting, setRequesting] = useState(false); // ← new
  const [requested, setRequested] = useState(false); // ← new

  const refs = useRef<Array<HTMLInputElement | null>>(
    Array.from({ length: 6 }, () => null),
  );

  // ── Request OTP ──────────────────────────────────────────────────────────
  const handleRequestOtp = async () => {
    setRequesting(true);
    setError("");
    try {
      const csrfToken = Cookies.get("csrftoken");
      await axios.post(
        `${BACKEND_URL}/delivery/generate-otp/`,
        { quotation_id: quotationId },
        {
          headers: {
            "Content-Type": "application/json",
            "X-CSRFToken": csrfToken,
          },
          withCredentials: true,
        },
      );
      setRequested(true);
      setTimeout(() => refs.current[0]?.focus(), 0);
    } catch {
      setError("Failed to request OTP. Please try again.");
    } finally {
      setRequesting(false);
    }
  };

  const handleChange = (val: string, i: number) => {
    const clean = val.replace(/\D/g, "").slice(-1);
    const next = [...digits];
    next[i] = clean;
    setDigits(next);
    setError("");
    if (clean && i < 5) refs.current[i + 1]?.focus();
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>, i: number) => {
    if (e.key === "Backspace" && !digits[i] && i > 0) {
      refs.current[i - 1]?.focus();
      const next = [...digits];
      next[i - 1] = "";
      setDigits(next);
    }
    if (e.key === "ArrowLeft" && i > 0) refs.current[i - 1]?.focus();
    if (e.key === "ArrowRight" && i < 5) refs.current[i + 1]?.focus();
  };

  const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const text = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (!text.length) return;
    const next = Array.from({ length: 6 }, () => "");
    text.split("").forEach((c, j) => {
      next[j] = c;
    });
    setDigits(next);
    refs.current[Math.min(text.length, 5)]?.focus();
  };

  const handleVerify = async () => {
    setError("");
    setLoading(true);
    try {
      const { data } = await axios.post(
        `${BACKEND_URL}/delivery/verify-otp/`,
        { quotation_id: quotationId, otp: digits.join("") },
        { withCredentials: true },
      );
      setMessage(data.message);
      setConfirmed(true);
    } catch {
      setError("Invalid OTP. Please try again.");
      setDigits(Array.from({ length: 6 }, () => ""));
      refs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setDigits(Array.from({ length: 6 }, () => ""));
    setError("");
    setMessage("");
    setConfirmed(false);
    setRequested(false);
    setTimeout(() => refs.current[0]?.focus(), 0);
  };

  const boxStyle = (i: number) => {
    if (confirmed) return "border-green-500 bg-green-50 text-green-700";
    if (error) return "border-red-400 bg-red-50 text-red-700";
    if (digits[i]) return "border-blue-500 text-blue-700 bg-white";
    return "border-gray-300 bg-gray-50 text-gray-800";
  };

  return (
    <div className="max-w-sm mx-auto py-8">
      {/* Heading */}
      <div className="flex flex-col items-center mb-6 text-center">
        <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-3">
          <svg
            className="w-5 h-5 text-gray-500"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.8}
            strokeLinecap="round"
            strokeLinejoin="round"
            viewBox="0 0 24 24"
          >
            <rect x={3} y={11} width={18} height={11} rx={2} ry={2} />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
        </div>
        <h2 className="text-base font-medium text-gray-800">Verify Delivery</h2>
        <p className="text-xs text-gray-400 mt-1">Quotation #{quotationId}</p>
      </div>

      {/* Success */}
      {message && (
        <div className="mb-4 px-4 py-2.5 bg-green-50 border border-green-200 text-green-700 text-sm rounded-lg text-center">
          ✓ {message}
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="mb-4 px-4 py-2.5 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg text-center">
          {error}
        </div>
      )}

      {/* Request OTP button */}
      <button
        onClick={handleRequestOtp}
        disabled={requesting || confirmed}
        className="w-full py-2.5 text-sm font-medium text-blue-600 bg-blue-50 border border-blue-200
          rounded-lg hover:bg-blue-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed mb-4"
      >
        {requesting
          ? "Requesting..."
          : requested
            ? "✓ OTP Requested"
            : "Request OTP from Vendor"}
      </button>

      {/* OTP boxes */}
      <div className="flex gap-2.5 justify-center mb-6">
        {digits.map((d, i) => (
          <input
            key={i}
            ref={(el) => {
              refs.current[i] = el;
            }}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={d}
            onChange={(e) => handleChange(e.target.value, i)}
            onKeyDown={(e) => handleKeyDown(e, i)}
            onPaste={handlePaste}
            disabled={confirmed}
            style={{ fontFamily: "'JetBrains Mono', monospace" }}
            className={`w-11 h-14 border rounded-lg text-center text-xl font-semibold
              outline-none transition-all focus:ring-2 focus:ring-blue-400
              focus:border-blue-500 disabled:opacity-60 disabled:cursor-not-allowed
              ${boxStyle(i)}`}
          />
        ))}
      </div>

      {/* Verify / Reset */}
      {!confirmed ? (
        <button
          onClick={handleVerify}
          disabled={!digits.every((d) => d !== "") || loading}
          style={{ fontFamily: "'JetBrains Mono', monospace" }}
          className="w-full py-2.5 text-sm font-medium text-white bg-blue-600
            rounded-lg hover:bg-blue-700 transition-colors
            disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Verifying..." : "Confirm Delivery"}
        </button>
      ) : (
        <button
          onClick={handleReset}
          className="w-full py-2.5 text-sm font-medium text-gray-600 bg-gray-100
            rounded-lg hover:bg-gray-200 transition-colors"
        >
          Verify another
        </button>
      )}
    </div>
  );
}
// ─── HOD Page ─────────────────────────────────────────────────────────────────

export default function Page() {
  const [activeTab, setActiveTab] = useState<
    "quotations" | "responses" | "verify"
  >("quotations");
  const [quotationId, setQuotationId] = useState("");
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
            {(["quotations", "responses", "verify"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-3 text-sm font-medium transition-colors border-b-2 -mb-px ${
                  activeTab === tab
                    ? "border-blue-600 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                {tab === "quotations"
                  ? "My quotations"
                  : tab === "responses"
                    ? "Vendor responses"
                    : "Verify Delivery"}
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

            {/* Verify Delivery tab */}
            {activeTab === "verify" && (
              <div>
                {/* Manual quotation ID input */}
                <div className="mb-2">
                  <label className="block text-xs text-gray-500 mb-1">
                    Quotation ID
                  </label>
                  <input
                    type="text"
                    value={quotationId}
                    onChange={(e) => setQuotationId(e.target.value)}
                    placeholder="Enter quotation ID e.g. 5"
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* OTP component — re-mounts when ID changes */}
                {quotationId.trim() && (
                  <OtpVerify
                    key={quotationId}
                    quotationId={quotationId.trim()}
                  />
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
