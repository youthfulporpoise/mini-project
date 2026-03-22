// app/hod/page.tsx
"use client";

import {
  useState,
  useRef,
  useEffect,
  KeyboardEvent,
  ClipboardEvent,
} from "react";
import { useRouter } from "next/navigation";
import { FileText, Users, ShieldCheck } from "lucide-react";
import axios from "axios";
import { QtResponses } from "../components/QtResponse";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

// ─── OTP Component ────────────────────────────────────────────────────────────

interface OtpVerifyProps {
  quotationId: string;
}

function OtpVerify({ quotationId }: OtpVerifyProps) {
  const [digits, setDigits] = useState<string[]>(
    Array.from({ length: 6 }, () => "")
  );
  const [message, setMessage] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [confirmed, setConfirmed] = useState<boolean>(false);
  const [timer, setTimer] = useState<number>(30);
  const [canResend, setCanResend] = useState<boolean>(false);

  const refs = useRef<Array<HTMLInputElement | null>>(
    Array.from({ length: 6 }, () => null)
  );

  useEffect(() => {
    if (timer <= 0) {
      setCanResend(true);
      return;
    }
    const id = setTimeout(() => setTimer((t) => t - 1), 1000);
    return () => clearTimeout(id);
  }, [timer]);

  const isFull = digits.every((d) => d !== "");

  const handleChange = (val: string, i: number) => {
    const clean = val.replace(/\D/g, "").slice(-1);
    const next = [...digits];
    next[i] = clean;
    setDigits(next);
    setError("");
    if (clean && i < 5) {
      refs.current[i + 1]?.focus();
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>, i: number) => {
    if (e.key === "Backspace") {
      if (!digits[i] && i > 0) {
        refs.current[i - 1]?.focus();
        const next = [...digits];
        next[i - 1] = "";
        setDigits(next);
      }
    }
    if (e.key === "ArrowLeft" && i > 0) refs.current[i - 1]?.focus();
    if (e.key === "ArrowRight" && i < 5) refs.current[i + 1]?.focus();
  };

  const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const text = e.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, 6);
    if (text.length > 0) {
      const next = Array.from({ length: 6 }, () => "");
      text.split("").forEach((c, j) => {
        next[j] = c;
      });
      setDigits(next);
      refs.current[Math.min(text.length, 5)]?.focus();
    }
  };

  const handleVerify = () => {
    setError("");
    setMessage("");
    setLoading(true);

    const verifyOtp = async () => {
      try {
        const url = `${BACKEND_URL}/delivery/verify-otp/`;
        const options = {
          headers: {
            "Content-Type": "application/json",
          },
        };
        const response = await axios.post(
          url,
          { quotation_id: quotationId, otp: digits.join("") },
          options
        );
        const data = response.data;
        setMessage(data.message);
        setConfirmed(true);
      } catch {
        console.log("Error");
        setError("Invalid OTP. Please try again.");
        setDigits(Array.from({ length: 6 }, () => ""));
        refs.current[0]?.focus();
      } finally {
        setLoading(false);
      }
    };

    verifyOtp();
  };

  const handleResend = () => {
    setDigits(Array.from({ length: 6 }, () => ""));
    setError("");
    setMessage("OTP resent to vendor device.");
    setTimer(30);
    setCanResend(false);
    setConfirmed(false);
    setTimeout(() => {
      refs.current[0]?.focus();
    }, 0);
  };

  const boxStyle = (i: number): string => {
    if (confirmed) return "border-green-500 bg-green-50 text-green-700";
    if (error) return "border-red-400 bg-red-50 text-red-700";
    if (digits[i]) return "border-blue-500 text-blue-700 bg-white";
    return "border-gray-300 bg-gray-50 text-gray-800";
  };

  return (
    <div className="max-w-sm mx-auto py-8">
      {/* Icon and heading */}
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
        <p className="text-xs text-gray-400 mt-1">
          Enter the 6-digit OTP provided by the vendor
        </p>
      </div>

      {/* Success message */}
      {message && (
        <div className="mb-4 px-4 py-2.5 bg-green-50 border border-green-200 text-green-700 text-sm rounded-lg text-center">
          ✓ {message}
        </div>
      )}

      {/* Error message */}
      {error && (
        <div className="mb-4 px-4 py-2.5 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg text-center">
          {error}
        </div>
      )}

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
            style={{ fontFamily: "'JetBrains Mono', 'Courier New', monospace" }}
            className={`w-11 h-14 border rounded-lg text-center text-xl font-semibold
              outline-none transition-all focus:ring-2 focus:ring-blue-400
              focus:border-blue-500 disabled:opacity-60 disabled:cursor-not-allowed
              ${boxStyle(i)}`}
          />
        ))}
      </div>

      {/* Verify button */}
      <button
        type="button"
        onClick={handleVerify}
        disabled={!isFull || loading || confirmed}
        style={{ fontFamily: "'JetBrains Mono', monospace" }}
        className="w-full py-2.5 text-sm font-medium text-white bg-blue-600
          rounded-lg hover:bg-blue-700 transition-colors
          disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? "Verifying..." : confirmed ? "✓ Confirmed" : "Confirm Delivery"}
      </button>

      {/* Resend row */}
      <div className="flex items-center justify-center gap-2 mt-3 text-xs text-gray-400">
        <span>Didn&apos;t receive OTP?</span>
        <button
          type="button"
          onClick={handleResend}
          disabled={!canResend}
          style={{ fontFamily: "'JetBrains Mono', monospace" }}
          className="text-blue-600 font-medium disabled:text-gray-400
            disabled:cursor-not-allowed hover:underline"
        >
          Resend
        </button>
        {!canResend && (
          <span
            style={{ fontFamily: "'JetBrains Mono', monospace" }}
            className="font-semibold text-blue-600"
          >
            0:{String(timer).padStart(2, "0")}
          </span>
        )}
      </div>
    </div>
  );
}

// ─── HOD Page ─────────────────────────────────────────────────────────────────

export default function HODPage() {
  const [activeTab, setActiveTab] = useState<
    "quotations" | "responses" | "verify"
  >("quotations");
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
              <OtpVerify quotationId="5" />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}