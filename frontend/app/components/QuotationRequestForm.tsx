"use client";
import { useState } from "react";
import {
  FileText,
  Package,
  Send,
  Plus,
  Trash2,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
} from "lucide-react";

import { Quotation, QuotationItems } from "../utility/index";
import { v4 as uuidv4 } from "uuid";

import { toISOFormat } from "../src/utils/DateFormat";
import { redirect, RedirectType } from "next/navigation";
import { createQuotation } from "../utility/api";

// ─── Form Section Component ──────────────────────────────────────────────────
function FormSection({
  title,
  icon,
  isExpanded,
  onToggle,
  children,
  required = false,
}: {
  title: string;
  icon: React.ReactNode;
  isExpanded: boolean;
  onToggle: () => void;
  children: React.ReactNode;
  required?: boolean;
}) {
  return (
    <div className="overflow-hidden rounded-[14px] border border-black/[0.06] bg-white shadow-sm transition-all duration-200">
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center justify-between px-6 py-4 transition-colors hover:bg-[#F9FAFB]"
      >
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#FB4D27]/10 text-[#FB4D27]">
            {icon}
          </div>
          <div className="text-left">
            <h3 className="flex items-center gap-2 text-[15px] font-bold tracking-[-0.01em] text-[#111110]">
              {title}
              {required && <span className="text-[#FB4D27]">*</span>}
            </h3>
          </div>
        </div>
        <div className="flex h-8 w-8 items-center justify-center rounded-md bg-[#F2F2F2] text-[#929090] transition-colors hover:bg-black/5 hover:text-[#111110]">
          {isExpanded ? (
            <ChevronUp className="h-5 w-5" />
          ) : (
            <ChevronDown className="h-5 w-5" />
          )}
        </div>
      </button>

      {isExpanded && (
        <div className="border-t border-black/[0.06] px-6 pb-6">
          <div className="pt-6">{children}</div>
        </div>
      )}
    </div>
  );
}

// ─── Main Form Component ─────────────────────────────────────────────────────
export default function QuotationRequestForm() {
  const [expandedSections, setExpandedSections] = useState({
    basic: true,
    items: true,
  });

  const [formData, setFormData] = useState<Quotation>({
    id: uuidv4(),
    category: "",
    quotationTitle: "",
    description: "",
    department: "",
    submissionDeadline: "",
    deliveryPeriod: 0,
    status: "PENDING",
    qtReqVerifiedAccountant: false,
    finalQtVerifiedAccountant: false,
    qtVerifiedPrincipal: false,
    items: [
      {
        id: uuidv4(),
        itemName: "",
        itemDescription: "",
        amount: 0,
      },
    ],
  });

  const [status, setStatus] = useState<"published" | null>(null);

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section as keyof typeof prev],
    }));
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const addItem = () => {
    const newItem: QuotationItems = {
      id: uuidv4(),
      itemName: "",
      itemDescription: "",
      amount: 0,
    };
    setFormData((prev) => ({
      ...prev,
      items: [...prev.items, newItem],
    }));
  };

  const removeItem = (id: string) => {
    if (formData.items.length > 1) {
      setFormData((prev) => ({
        ...prev,
        items: prev.items.filter((item) => item.id !== id),
      }));
    }
  };

  const updateItem = (
    id: string,
    field: keyof QuotationItems,
    value: string,
  ) => {
    setFormData((prev) => ({
      ...prev,
      items: prev.items.map((item) =>
        item.id === id ? { ...item, [field]: value } : item,
      ),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const backendData = {
        id: formData.id,
        category: formData.category,
        title: formData.quotationTitle,
        description: formData.description,
        department: formData.department,
        submission_deadline: toISOFormat(formData.submissionDeadline),
        delivery_period: `${formData.deliveryPeriod} 00:00:00`,
        status: formData.status,
        qt_req_verified_accountant: formData.qtReqVerifiedAccountant,
        final_qt_verified_accountant: formData.finalQtVerifiedAccountant,
        qt_verified_principal: formData.qtVerifiedPrincipal,
        items: formData.items.map((item) => ({
          id: item.id,
          name: item.itemName,
          description: item.itemDescription,
          amount: item.amount,
        })),
      };

      const newQuotation = await createQuotation(backendData);

      if (newQuotation) {
        console.log("Successfully created!", newQuotation);
        setStatus("published");
      } else {
        console.log("Failed to create quotation.");
      }

      setTimeout(() => {
        setStatus(null);
        // Reset form
        setFormData({
          id: uuidv4(),
          category: "",
          quotationTitle: "",
          description: "",
          department: "",
          submissionDeadline: "",
          deliveryPeriod: 0,
          status: "PENDING",
          qtReqVerifiedAccountant: false,
          finalQtVerifiedAccountant: false,
          qtVerifiedPrincipal: false,
          items: [
            { id: uuidv4(), itemName: "", itemDescription: "", amount: 0 },
          ],
        });
        setExpandedSections({ basic: true, items: true });
        redirect("/hod", RedirectType.replace);
      }, 2500);
    } catch (error) {
      console.error("Error:", error);
    }
  };

  if (status === "published") {
    return (
      <div className="flex flex-col items-center justify-center rounded-[14px] border border-black/[0.06] bg-white p-12 text-center shadow-sm">
        <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-[#28CA41]/10">
          <CheckCircle2 className="h-10 w-10 text-[#1a8c30]" />
        </div>
        <h2 className="mb-2 text-[24px] font-bold tracking-[-0.02em] text-[#111110]">
          Quotation Published!
        </h2>
        <p className="text-[14px] text-[#929090]">
          Your quotation request has been securely published and eligible
          vendors will be notified.
        </p>
      </div>
    );
  }

  // Common input classes for consistency
  const inputClasses =
    "w-full rounded-[9px] border-[1.5px] border-black/10 bg-[#F2F2F2] px-[14px] py-[11px] text-[14px] text-[#111110] outline-none transition-all duration-200 placeholder:text-[#D3D6DA] focus:border-[#FB4D27] focus:bg-white focus:shadow-[0_0_0_3px_rgba(251,77,39,0.1)]";
  const labelClasses =
    "mb-[7px] block text-[11.5px] font-semibold uppercase tracking-[0.07em] text-[#929090]";

  return (
    <form className="font-sans space-y-6" onSubmit={handleSubmit}>
      <FormSection
        title="1. Basic Quotation Information"
        icon={<FileText size={20} />}
        isExpanded={expandedSections.basic}
        onToggle={() => toggleSection("basic")}
        required
      >
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
          <div className="md:col-span-2">
            <label className={labelClasses}>
              Quotation Title <span className="text-[#FB4D27]">*</span>
            </label>
            <input
              type="text"
              name="quotationTitle"
              value={formData.quotationTitle}
              onChange={handleChange}
              required
              className={inputClasses}
              placeholder="e.g., Supply of Desktop Computers for CSE Department"
            />
          </div>

          <div>
            <label className={labelClasses}>
              Department <span className="text-[#FB4D27]">*</span>
            </label>
            <select
              name="department"
              value={formData.department}
              onChange={handleChange}
              required
              className={inputClasses}
            >
              <option value="">Select Department</option>
              <option value="CSE">Computer Science & Engineering</option>
              <option value="ECE">Electronics & Communication</option>
              <option value="ME">Mechanical Engineering</option>
              <option value="CE">Civil Engineering</option>
              <option value="EE">Electrical Engineering</option>
              <option value="Admin">Administration</option>
              <option value="Finance">Finance</option>
              <option value="IT">IT Services</option>
            </select>
          </div>

          <div>
            <label className={labelClasses}>
              Category <span className="text-[#FB4D27]">*</span>
            </label>
            <input
              name="category"
              value={formData.category}
              onChange={handleChange}
              placeholder="e.g., Software, Lab Equipment"
              required
              className={inputClasses}
            />
          </div>

          <div>
            <label className={labelClasses}>
              Submission Deadline <span className="text-[#FB4D27]">*</span>
            </label>
            <input
              type="date"
              name="submissionDeadline"
              value={formData.submissionDeadline}
              onChange={handleChange}
              required
              className={inputClasses}
            />
          </div>

          <div>
            <label className={labelClasses}>
              Delivery Period (Days) <span className="text-[#FB4D27]">*</span>
            </label>
            <input
              type="number"
              name="deliveryPeriod"
              value={formData.deliveryPeriod || ""}
              onChange={handleChange}
              required
              min="1"
              className={inputClasses}
              placeholder="e.g., 15"
            />
          </div>

          <div className="md:col-span-3">
            <label className={labelClasses}>Detailed Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={3}
              className={`${inputClasses} resize-none`}
              placeholder="Provide a comprehensive overview of the quotation requirements..."
            />
          </div>
        </div>
      </FormSection>

      <FormSection
        title="2. Item / Service Details"
        icon={<Package size={20} />}
        isExpanded={expandedSections.items}
        onToggle={() => toggleSection("items")}
        required
      >
        <div className="space-y-5">
          {formData.items.map((item, index) => (
            <div
              key={item.id}
              className="rounded-[12px] border border-black/10 bg-[#FAFAFA] p-5 transition-colors focus-within:border-[#FB4D27]/30 focus-within:bg-white"
            >
              <div className="mb-4 flex items-center justify-between">
                <h4 className="font-mono text-[13px] font-bold tracking-[0.06em] text-[#111110]">
                  ITEM {String(index + 1).padStart(2, "0")}
                </h4>
                {formData.items.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeItem(item.id)}
                    className="inline-flex items-center gap-1.5 rounded-md bg-[#FF5F57]/10 px-2.5 py-1.5 text-[12px] font-semibold text-[#c53030] transition-colors hover:bg-[#FF5F57]/20"
                  >
                    <Trash2 size={14} /> Remove
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                <div>
                  <label className={labelClasses}>
                    Item Name <span className="text-[#FB4D27]">*</span>
                  </label>
                  <input
                    type="text"
                    value={item.itemName}
                    onChange={(e) =>
                      updateItem(item.id, "itemName", e.target.value)
                    }
                    required
                    className={inputClasses}
                    placeholder="e.g., Desktop Computer"
                  />
                </div>

                <div>
                  <label className={labelClasses}>
                    Allocated Amount (₹){" "}
                    <span className="text-[#FB4D27]">*</span>
                  </label>
                  <input
                    type="number"
                    value={item.amount || ""}
                    onChange={(e) =>
                      updateItem(item.id, "amount", e.target.value)
                    }
                    required
                    min="1"
                    className={`${inputClasses} font-mono font-medium`}
                    placeholder="Enter Budget Amount"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className={labelClasses}>
                    Specifications / Description
                  </label>
                  <textarea
                    value={item.itemDescription}
                    onChange={(e) =>
                      updateItem(item.id, "itemDescription", e.target.value)
                    }
                    rows={2}
                    className={`${inputClasses} resize-none`}
                    placeholder="Brand, model, standards, compliance details..."
                  />
                </div>
              </div>
            </div>
          ))}

          <button
            type="button"
            onClick={addItem}
            className="flex w-full items-center justify-center gap-2 rounded-[10px] border-[1.5px] border-dashed border-black/15 bg-transparent py-3.5 text-[13.5px] font-semibold text-[#4C433F] transition-all duration-200 hover:border-[#111110] hover:bg-[#111110] hover:text-white"
          >
            <Plus size={16} />
            Add Another Item
          </button>
        </div>
      </FormSection>

      <div className="sticky bottom-4 z-10 rounded-[14px] border border-black/[0.06] bg-white/90 p-5 backdrop-blur-md shadow-[0_8px_30px_rgba(0,0,0,0.08)]">
        <div className="flex items-center justify-between">
          <div className="text-left">
            <p className="text-[11px] font-semibold uppercase tracking-[0.06em] text-[#929090]">
              Total Est. Budget
            </p>
            <p className="font-mono text-[20px] font-bold text-[#111110]">
              ₹
              {formData.items
                .reduce((sum, item) => sum + (Number(item.amount) || 0), 0)
                .toLocaleString("en-IN")}
            </p>
          </div>
          <button
            type="submit"
            className="inline-flex items-center gap-2 rounded-[9px] bg-[#111110] px-7 py-3.5 text-[14px] font-semibold text-white transition-all duration-200 hover:-translate-y-[1px] hover:bg-[#FB4D27] hover:shadow-[0_4px_12px_rgba(251,77,39,0.25)] active:translate-y-0"
          >
            <Send size={16} />
            Publish Request
          </button>
        </div>
      </div>
    </form>
  );
}
