"use client";

import React, { useState } from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

// ── Types ────────────────────────────────────────────────────────────────────
export type RazorpayTransaction = {
  id: string;
  amount: number;
  currency: string;
  status: string;
  method: string;
  bank: string | null;
  email: string;
  contact: string;
  created_at: number;
  description: string | null;
  quotation_number?: string;
};

interface ExportButtonProps {
  transactions: RazorpayTransaction[];
}

// ── Formatting Helpers ───────────────────────────────────────────────────────
const formatAmount = (amount: number, currency: string): string =>
  `${currency === "INR" ? "Rs." : currency} ${(amount / 100).toLocaleString(
    "en-IN",
    {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    },
  )}`;

const formatDate = (timestamp: number): string =>
  new Date(timestamp * 1000).toLocaleString("en-IN", {
    month: "short",
    day: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });

// ── Export Component ─────────────────────────────────────────────────────────
export const ExportTransactionsPDFButton: React.FC<ExportButtonProps> = ({
  transactions,
}) => {
  const [isGenerating, setIsGenerating] = useState(false);

  const generatePDF = () => {
    // Standard Landscape A4 size to prevent text overlapping across 6 columns
    const doc = new jsPDF("l", "pt", "a4");
    const pageWidth = doc.internal.pageSize.getWidth();

    const generatedAt = new Date().toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });

    // Render Elegant Serif Heading
    doc.setFont("times", "bold");
    doc.setFontSize(24);
    doc.setTextColor(17, 24, 39);
    doc.text("Transactions", 40, 52);

    // Render Clean Sans-Serif Subtitle
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(107, 114, 128);
    doc.text(`Generated: ${generatedAt}`, 40, 70);

    const headers = [
      "TRANSACTION ID",
      "DATE & TIME",
      "CUSTOMER / VENDOR INFO",
      "PAYMENT METHOD",
      "AMOUNT (INR)",
      "STATUS",
    ];

    const rows = transactions.map((t) => [
      t.id,
      formatDate(t.created_at),
      t.email,
      `${t.method.toUpperCase()} · ${t.bank ? t.bank.toUpperCase() : "CNRB"}`,
      formatAmount(t.amount, t.currency),
      t.status.toUpperCase() === "CAPTURED"
        ? "SETTLED"
        : t.status.toUpperCase(),
    ]);

    // Append Summary Calculation Total directly to table bottom
    const totalSum = transactions.reduce((sum, t) => sum + t.amount, 0);
    const targetCurrency = transactions[0]?.currency || "INR";
    rows.push([
      "Total Summary",
      "",
      "",
      "",
      formatAmount(totalSum, targetCurrency),
      "",
    ]);

    autoTable(doc, {
      startY: 95,
      head: [headers],
      body: rows,
      margin: { left: 40, right: 40 },
      theme: "striped",
      styles: {
        fontSize: 9,
        font: "times",
        cellPadding: { top: 12, bottom: 12, left: 10, right: 10 },
        valign: "middle",
        textColor: [55, 65, 81],
        overflow: "linebreak",
      },
      headStyles: {
        fillColor: [249, 250, 251],
        textColor: [107, 114, 128],
        font: "helvetica",
        fontSize: 8.5,
        fontStyle: "bold",
        halign: "left",
      },
      alternateRowStyles: {
        fillColor: [251, 252, 253],
      },
      columnStyles: {
        0: { cellWidth: 130, fontStyle: "bold", textColor: [17, 24, 39] },
        1: { cellWidth: 120 },
        2: { cellWidth: 170 },
        3: { cellWidth: 140, fontStyle: "bold" },
        4: {
          cellWidth: 110,
          halign: "left",
          fontStyle: "bold",
          textColor: [17, 24, 39],
        },
        5: { cellWidth: 92, halign: "center" },
      },
      didDrawCell: (data) => {
        // Style Total Summary Row explicitly
        if (data.section === "body" && data.row.index === rows.length - 1) {
          doc.setFont("times", "bold");
          doc.setTextColor(17, 24, 39);
          if (data.column.index === 0 || data.column.index === 4) {
            const text = data.cell.text[0] || "";
            doc.text(
              text,
              data.cell.x + 10,
              data.cell.y + data.cell.height / 2 + 3,
            );
          }
          return;
        }

        // Draw Minimalist Status Tags
        if (data.section === "body" && data.column.index === 5) {
          const text = data.cell.text[0] || "";
          let bgR = 243,
            bgG = 244,
            bgB = 246;
          let textR = 107,
            textG = 114,
            textB = 128;

          if (text === "SETTLED") {
            bgR = 240;
            bgG = 253;
            bgB = 244;
            textR = 21;
            textG = 128;
            textB = 61;
          } else if (text === "FAILED") {
            bgR = 254;
            bgG = 242;
            bgB = 242;
            textR = 185;
            textG = 28;
            textB = 28;
          }

          const padX = 6;
          const padY = 6;
          const x = data.cell.x + padX;
          const y = data.cell.y + padY;
          const w = data.cell.width - padX * 2;
          const h = data.cell.height - padY * 2;

          doc.setFillColor(bgR, bgG, bgB);
          doc.roundedRect(x, y, w, h, 4, 4, "F");

          doc.setFont("helvetica", "bold");
          doc.setFontSize(8);
          doc.setTextColor(textR, textG, textB);
          doc.text(
            text,
            data.cell.x + data.cell.width / 2,
            data.cell.y + data.cell.height / 2 + 3,
            {
              align: "center",
            },
          );
        }
      },
    });

    // Render Page Number Footnotes
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      const footerY = doc.internal.pageSize.getHeight() - 25;
      doc.setFontSize(8);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(156, 163, 175);
      doc.text(`Page ${i} of ${pageCount}`, pageWidth - 40, footerY, {
        align: "right",
      });
    }

    doc.save(`transactions_${Date.now()}.pdf`);
  };

  const handleDownload = async () => {
    try {
      setIsGenerating(true);
      await new Promise((resolve) => setTimeout(resolve, 250)); // Allow spinner render frame
      generatePDF();
    } catch (error) {
      console.error("PDF generation crashed:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <button
      onClick={handleDownload}
      disabled={isGenerating || transactions.length === 0}
      className="cursor-pointer inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium transition-colors bg-white border rounded-md shadow-sm border-gray-200 text-gray-700 hover:bg-gray-50 hover:text-gray-900 active:bg-gray-100 disabled:opacity-50 disabled:pointer-events-none focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2"
    >
      {isGenerating ? (
        <svg
          className="w-4 h-4 text-gray-500 animate-spin"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      ) : (
        <svg
          className="w-4 h-4 text-gray-500"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 640 640"
          fill="currentColor"
        >
          <path d="M352 96C352 78.3 337.7 64 320 64C302.3 64 288 78.3 288 96L288 306.7L246.6 265.3C234.1 252.8 213.8 252.8 201.3 265.3C188.8 277.8 188.8 298.1 201.3 310.6L297.3 406.6C309.8 419.1 330.1 419.1 342.6 406.6L438.6 310.6C451.1 298.1 451.1 277.8 438.6 265.3C426.1 252.8 405.8 252.8 393.3 265.3L352 306.7L352 96zM160 384C124.7 384 96 412.7 96 448L96 480C96 515.3 124.7 544 160 544L480 544C515.3 544 544 515.3 544 480L544 448C544 412.7 515.3 384 480 384L433.1 384L376.5 440.6C345.3 471.8 294.6 471.8 263.4 440.6L206.9 384L160 384zM464 440C477.3 440 488 450.7 488 464C488 477.3 477.3 488 464 488C450.7 488 440 477.3 440 464C440 450.7 450.7 440 464 440z" />
        </svg>
      )}
      <span>{isGenerating ? "Generating Report..." : "Download Report"}</span>
    </button>
  );
};
