"use client";

import { QtResponses } from "../components/QtResponses";
import QuotationRequestForm from "../components/QuotationRequestForm";
import { Sidebar } from "../components/Sidebar";

export default function Page() {
  return (
    <div className="flex flex-row ">
      <Sidebar />
      <div className="space-y-6 p-5 overflow-y-scroll h-screen w-[80vw] items-center">
        <QuotationRequestForm />
        <QtResponses />
      </div>
    </div>
  );
}
