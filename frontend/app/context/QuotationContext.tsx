// app/context/QuotationContext.tsx
"use client";
import { createContext, useContext, useState, ReactNode } from "react";
import { Quotation } from "../utility/index";

interface QuotationContextType {
  selectedQuotation: Quotation | null;
  setSelectedQuotation: (quotation: Quotation | null) => void;
}

const initialQuotationState: QuotationContextType = {
  selectedQuotation: null,
  setSelectedQuotation: () => {},
};

const QuotationContext = createContext<QuotationContextType>(
  initialQuotationState,
);

export function QuotationProvider({ children }: { children: ReactNode }) {
  const [selectedQuotation, setSelectedQuotation] = useState<Quotation | null>(
    null,
  );

  return (
    <QuotationContext.Provider
      value={{ selectedQuotation, setSelectedQuotation }}
    >
      {children}
    </QuotationContext.Provider>
  );
}

export const useQuotation = () => useContext(QuotationContext);
