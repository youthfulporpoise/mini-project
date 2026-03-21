"use client";
import QuotationRequestForm from "@/app/components/QuotationRequestForm";

const Page = () => {
  return (
    <div className="min-h-screen bg-slate-100">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="mb-6">
          <p className="text-sm text-gray-500 mb-1">HOD Portal</p>
          <h1 className="text-2xl font-semibold text-gray-800">
            New Quotation Request
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Fill in the details below and publish to notify vendors.
          </p>
        </div>

        {/* Form */}
        <QuotationRequestForm />
      </div>
    </div>
  );
};

export default Page;
