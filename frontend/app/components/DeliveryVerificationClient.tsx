"use client";
import { useMemo } from "react";

import { useState, useRef, KeyboardEvent, ClipboardEvent } from "react";
import {
  ShieldCheck,
  CheckCircle2,
  XCircle,
  KeyRound,
  Package,
  Search,
} from "lucide-react";
import axios from "axios";
import { verifyOTP } from "@/app/utility/api";

interface ApprovedQuotation {
  id: number;
  title: string;
  department: string;
  delivery_period: string;
}

export default function DeliveryVerificationClient({
  initialQuotations,
}: {
  initialQuotations: ApprovedQuotation[];
}) {
  const [selectedQuotation, setSelectedQuotation] =
    useState<ApprovedQuotation | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredQuotations = useMemo(() => {
    if (!searchQuery.trim()) {
      return initialQuotations;
    }

    const lowerQuery = searchQuery.toLowerCase();
    const filtered = initialQuotations.filter(
      (q) =>
        q.title.toLowerCase().includes(lowerQuery) ||
        String(q.id).includes(lowerQuery) ||
        q.department.toLowerCase().includes(lowerQuery),
    );
    return filtered;
  }, [searchQuery, initialQuotations]);

  return (
    <div className="flex min-h-screen bg-[#F2F2F2] font-sans">
      <main className="flex-1 px-[clamp(20px,4vw,40px)] py-[clamp(24px,4vw,40px)] transition-[margin-left] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] max-md:ml-[68px]">
        {/* ── Header ── */}
        <div className="mb-7 flex items-center justify-between">
          <div>
            <h1 className="mb-0.5 text-[22px] font-bold tracking-[-0.03em] text-[#111110]">
              Delivery Verification
            </h1>
            <p className="text-[13px] text-[#929090]">
              Head of Department — Validate incoming vendor deliveries.
            </p>
          </div>
        </div>

        {/* ── Two Column Layout ── */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          {/* ── Left Column: Approved Quotations List ── */}
          <div className="flex max-h-[calc(100vh-140px)] flex-col overflow-hidden rounded-[14px] border border-black/[0.06] bg-white shadow-sm lg:col-span-5 xl:col-span-4">
            <div className="border-b border-black/[0.06] bg-[#FAFAFA] px-5 py-4">
              <h2 className="mb-3 flex items-center gap-2 text-[15px] font-bold text-[#111110]">
                <Package size={18} className="text-[#5B7FA6]" />
                Expected Deliveries
              </h2>
              <div className="relative">
                <Search
                  size={14}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-[#929090]"
                />
                <input
                  type="text"
                  placeholder="Search ID, title, dept..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-[8px] border border-black/10 bg-white py-2 pl-9 pr-3 text-[13px] outline-none transition-colors focus:border-[#5B7FA6]"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-3">
              {filteredQuotations.length === 0 ? (
                <div className="py-10 text-center text-[13px] font-medium text-[#929090]">
                  No approved deliveries found.
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  {filteredQuotations.map((q) => (
                    <button
                      key={q.id}
                      onClick={() => setSelectedQuotation(q)}
                      className={`flex flex-col items-start rounded-[10px] border p-4 text-left transition-all ${
                        selectedQuotation?.id === q.id
                          ? "border-[#28CA41] bg-[#28CA41]/5 shadow-sm ring-1 ring-[#28CA41]/20"
                          : "border-transparent bg-[#FAFAFA] hover:border-black/10 hover:bg-white"
                      }`}
                    >
                      <div className="mb-1 flex w-full items-center justify-between gap-2">
                        <span className="font-mono text-[11px] font-bold tracking-[0.06em] text-[#929090]">
                          REQ #{q.id}
                        </span>
                        {selectedQuotation?.id === q.id && (
                          <span className="rounded-full bg-[#28CA41]/20 px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.06em] text-[#1a8c30]">
                            Selected
                          </span>
                        )}
                      </div>
                      <h3
                        className={`line-clamp-2 text-[14px] font-bold leading-snug ${selectedQuotation?.id === q.id ? "text-[#1a8c30]" : "text-[#111110]"}`}
                      >
                        {q.title}
                      </h3>
                      <p className="mt-1 text-[12px] text-[#929090]">
                        {q.department}
                      </p>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* ── Right Column: Verification Widget ── */}
          <div className="lg:col-span-7 xl:col-span-8">
            <div className="flex h-full flex-col overflow-hidden rounded-[14px] border border-black/[0.06] bg-white p-8 shadow-sm">
              {!selectedQuotation ? (
                <div className="flex h-full flex-col items-center justify-center text-center">
                  <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-[16px] bg-[#F2F2F2]">
                    <ShieldCheck size={32} className="text-[#D3D6DA]" />
                  </div>
                  <h2 className="mb-1 text-[18px] font-bold text-[#111110]">
                    Select a Delivery
                  </h2>
                  <p className="text-[13.5px] text-[#929090] max-w-sm">
                    Choose an approved quotation from the list on the left to
                    verify its delivery receipt.
                  </p>
                </div>
              ) : (
                <div className="mx-auto flex h-full w-full max-w-[450px] flex-col justify-center animate-in fade-in zoom-in-95 duration-200">
                  <div className="mb-8 flex flex-col items-center border-b border-black/[0.06] pb-8 text-center">
                    <div className="mb-4 flex h-[64px] w-[64px] items-center justify-center rounded-[18px] bg-[#28CA41]/10">
                      <ShieldCheck size={32} className="text-[#1a8c30]" />
                    </div>
                    <h2 className="text-[22px] font-bold tracking-[-0.02em] text-[#111110]">
                      Verify Delivery Receipt
                    </h2>
                    <p className="mt-2 text-[13.5px] text-[#929090]">
                      Enter the 6-digit OTP provided by the vendor to securely
                      log the delivery for{" "}
                      <span className="font-semibold text-[#111110]">
                        Req #{selectedQuotation.id}
                      </span>
                      .
                    </p>
                  </div>

                  <OtpVerifyWidget
                    key={selectedQuotation.id}
                    quotationId={String(selectedQuotation.id)}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

// ─── OTP Verification Sub-Component ───────────────────────────────────────────
function OtpVerifyWidget({ quotationId }: { quotationId: string }) {
  const [digits, setDigits] = useState<string[]>(
    Array.from({ length: 6 }, () => ""),
  );
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [confirmed, setConfirmed] = useState(false);

  const refs = useRef<Array<HTMLInputElement | null>>(
    Array.from({ length: 6 }, () => null),
  );

  const handleChange = (val: string, i: number) => {
    const clean = val.replace(/\D/g, "").slice(-1);
    const next = [...digits];
    next[i] = clean;
    setDigits(next);
    setError(""); // Clear error when typing

    // Auto-advance to next input
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

  // API Integration for Verifying OTP
  const handleVerify = async () => {
    setError("");
    setMessage("");
    setLoading(true);

    try {
      const data = await verifyOTP(quotationId, digits.join(""));

      setMessage(data.message || "Delivery successfully verified!");
      setConfirmed(true);
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setError(
          err.response?.data?.message ||
            err.response?.data?.error ||
            "Invalid OTP. Please try again.",
        );
      } else {
        setError("An unexpected error occurred during verification.");
      }

      // Clear inputs on failure
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
  };

  const getBoxClass = (i: number) => {
    const baseClass =
      "h-[64px] w-[56px] rounded-[10px] border-[1.5px] border-[#D3D6DA] bg-[#F2F2F2] text-center font-mono text-[24px] font-bold text-[#111110] outline-none transition-all duration-200 focus:border-[#28CA41] focus:bg-white focus:shadow-[0_0_0_3px_rgba(40,202,65,0.12)]";
    if (confirmed)
      return `${baseClass} !border-[#28CA41] !bg-[#28CA41]/[0.06] !text-[#1a8c30]`;
    if (error)
      return `${baseClass} !border-[#e53e3e] !bg-[#e53e3e]/[0.05] !text-[#e53e3e]`;
    if (digits[i])
      return `${baseClass} !border-[#28CA41] !bg-white !text-[#1a8c30]`;
    return baseClass;
  };

  return (
    <div className="font-sans">
      <div className="mb-4 flex items-center justify-between">
        <label className="text-[11.5px] font-semibold uppercase tracking-[0.07em] text-[#929090]">
          Enter Vendor OTP
        </label>
        <KeyRound size={14} className="text-[#D3D6DA]" />
      </div>

      {/* Notifications */}
      {message && (
        <div className="mb-5 flex items-center gap-2 rounded-[9px] border border-[#28CA41]/25 bg-[#28CA41]/[0.08] px-4 py-3 text-[13px] font-medium text-[#1a8c30]">
          <CheckCircle2 size={16} /> {message}
        </div>
      )}
      {error && (
        <div className="mb-5 flex items-center gap-2 rounded-[9px] border border-[#e53e3e]/20 bg-[#e53e3e]/[0.06] px-4 py-3 text-[13px] font-medium text-[#c53030]">
          <XCircle size={16} /> {error}
        </div>
      )}

      {/* OTP Inputs */}
      <div className="mb-6 flex justify-between gap-2">
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
            className={getBoxClass(i)}
            autoFocus={i === 0}
          />
        ))}
      </div>

      {/* Verify / Reset */}
      {!confirmed ? (
        <button
          className="flex w-full items-center justify-center gap-2 rounded-[9px] bg-[#111110] p-[14px] text-[14px] font-semibold text-white transition-all duration-200 hover:-translate-y-[1px] hover:bg-[#28CA41] hover:shadow-[0_4px_12px_rgba(40,202,65,0.3)] active:translate-y-0 disabled:pointer-events-none disabled:opacity-40"
          onClick={handleVerify}
          disabled={!digits.every((d) => d !== "") || loading}
        >
          {loading ? (
            <>
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              Verifying…
            </>
          ) : (
            "Confirm Delivery Receipt"
          )}
        </button>
      ) : (
        <button
          className="w-full rounded-[9px] border-[1.5px] border-black/10 bg-white p-[14px] text-[14px] font-semibold text-[#929090] transition-all duration-200 hover:bg-[#F2F2F2] hover:text-[#111110]"
          onClick={handleReset}
        >
          Reset
        </button>
      )}
    </div>
  );
}
