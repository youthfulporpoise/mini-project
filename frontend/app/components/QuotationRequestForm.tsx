import { useState } from "react";
import {
  FileText,
  Package,
  Send,
  Plus,
  Trash2,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

interface QuotationItem {
  id: string;
  itemName: string;
  description: string;
  technicalSpecs: string;
  quantity: string;
  unit: string;
  qualityRequirements: string;
}

interface QuotationFormData {
  quotationId: string;
  quotationTitle: string;
  referenceNumber: string;
  department: string;
  createdBy: string;
  createdById: string;
  issueDate: string;
  submissionDeadline: string;
  deliveryPeriod: string;
  items: QuotationItem[];
}

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
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      <button
        type="button"
        onClick={onToggle}
        className="w-full px-6 py-4 flex items-center justify-between hover:bg-slate-50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="text-blue-600">{icon}</div>
          <div className="text-left">
            <h3 className="flex items-center gap-2">
              {title}
              {required && <span className="text-red-600 text-sm">*</span>}
            </h3>
          </div>
        </div>
        {isExpanded ? (
          <ChevronUp className="w-5 h-5 text-gray-600" />
        ) : (
          <ChevronDown className="w-5 h-5 text-gray-600" />
        )}
      </button>

      {isExpanded && (
        <div className="px-6 pb-6 border-t border-gray-200">
          <div className="pt-6">{children}</div>
        </div>
      )}
    </div>
  );
}

export default function QuotationRequestForm() {
  const generateQuotationId = () => {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const random = Math.floor(Math.random() * 10000)
      .toString()
      .padStart(4, "0");
    return `QR-${year}${month}-${random}`;
  };

  const [expandedSections, setExpandedSections] = useState({
    basic: true,
    items: true,
  });

  const [formData, setFormData] = useState<QuotationFormData>({
    quotationId: generateQuotationId(),
    quotationTitle: "",
    referenceNumber: "",
    department: "",
    createdBy: "",
    createdById: "",
    issueDate: new Date().toISOString().split("T")[0],
    submissionDeadline: "",
    deliveryPeriod: "",
    items: [
      {
        id: "1",
        itemName: "",
        description: "",
        technicalSpecs: "",
        quantity: "",
        unit: "Nos",
        qualityRequirements: "",
      },
    ],
  });

  const [status, setStatus] = useState<"published" | null>(null);

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
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
    const newItem: QuotationItem = {
      id: Date.now().toString(),
      itemName: "",
      description: "",
      technicalSpecs: "",
      quantity: "",
      unit: "Nos",
      qualityRequirements: "",
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
    field: keyof QuotationItem,
    value: string,
  ) => {
    setFormData((prev) => ({
      ...prev,
      items: prev.items.map((item) =>
        item.id === id ? { ...item, [field]: value } : item,
      ),
    }));
  };

  const handleSubmit = () => {
    console.log("Quotation Request:", { ...formData, status: "published" });
    setStatus("published");
    setTimeout(() => setStatus(null), 3000);
  };

  if (status) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-8 text-center">
        <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 bg-green-100">
          <Send className="w-8 h-8 text-green-600" />
        </div>
        <h2 className="text-2xl mb-2">Quotation Published!</h2>
        <p className="text-gray-600 mb-4">
          Your quotation request has been published and vendors will be
          notified.
        </p>
        <div className="bg-gray-100 p-4 rounded-lg inline-block">
          <p className="text-sm">
            Quotation ID: <strong>{formData.quotationId}</strong>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <FormSection
        title="1. Basic Quotation Information"
        icon={<FileText className="w-5 h-5" />}
        isExpanded={expandedSections.basic}
        onToggle={() => toggleSection("basic")}
        required
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label className="block mb-2">
              Quotation ID <span className="text-red-600">*</span>
            </label>
            <input
              type="text"
              name="quotationId"
              value={formData.quotationId}
              disabled
              className="w-full px-4 py-2.5 bg-gray-100 border border-gray-300 rounded-lg"
            />
            <p className="text-xs text-gray-500 mt-1">Auto-generated</p>
          </div>

          <div className="md:col-span-2">
            <label className="block mb-2">
              Quotation Title / Subject <span className="text-red-600">*</span>
            </label>
            <input
              type="text"
              name="quotationTitle"
              value={formData.quotationTitle}
              onChange={handleChange}
              required
              className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              placeholder="e.g., Supply of Desktop Computers for CSE Department"
            />
          </div>

          <div>
            <label className="block mb-2">
              Reference Number <span className="text-red-600">*</span>
            </label>
            <input
              type="text"
              name="referenceNumber"
              value={formData.referenceNumber}
              onChange={handleChange}
              required
              className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              placeholder="Official institutional reference"
            />
          </div>

          <div>
            <label className="block mb-2">
              Department / Section <span className="text-red-600">*</span>
            </label>
            <select
              name="department"
              value={formData.department}
              onChange={handleChange}
              required
              className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20"
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
            <label className="block mb-2">
              Created By (Name) <span className="text-red-600">*</span>
            </label>
            <input
              type="text"
              name="createdBy"
              value={formData.createdBy}
              onChange={handleChange}
              required
              className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              placeholder="Manager / Officer name"
            />
          </div>

          <div>
            <label className="block mb-2">
              Employee ID <span className="text-red-600">*</span>
            </label>
            <input
              type="text"
              name="createdById"
              value={formData.createdById}
              onChange={handleChange}
              required
              className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              placeholder="Employee ID"
            />
          </div>

          <div>
            <label className="block mb-2">
              Issue Date <span className="text-red-600">*</span>
            </label>
            <input
              type="date"
              name="issueDate"
              value={formData.issueDate}
              onChange={handleChange}
              required
              className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>

          <div>
            <label className="block mb-2">
              Last Date & Time for Submission{" "}
              <span className="text-red-600">*</span>
            </label>
            <input
              type="datetime-local"
              name="submissionDeadline"
              value={formData.submissionDeadline}
              onChange={handleChange}
              required
              className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>

          <div>
            <label className="block mb-2">
              Expected Delivery Period <span className="text-red-600">*</span>
            </label>
            <input
              type="text"
              name="deliveryPeriod"
              value={formData.deliveryPeriod}
              onChange={handleChange}
              required
              className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              placeholder="e.g., Within 15 days of order"
            />
          </div>
        </div>
      </FormSection>

      <FormSection
        title="2. Item / Service Details"
        icon={<Package className="w-5 h-5" />}
        isExpanded={expandedSections.items}
        onToggle={() => toggleSection("items")}
        required
      >
        <div className="space-y-6">
          {formData.items.map((item, index) => (
            <div
              key={item.id}
              className="border border-gray-300 rounded-lg p-4 bg-slate-50"
            >
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-medium">Item #{index + 1}</h4>
                {formData.items.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeItem(item.id)}
                    className="text-red-600 hover:text-red-800 flex items-center gap-1"
                  >
                    <Trash2 className="w-4 h-4" />
                    Remove
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block mb-2">
                    Item Name <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="text"
                    value={item.itemName}
                    onChange={(e) =>
                      updateItem(item.id, "itemName", e.target.value)
                    }
                    required
                    className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    placeholder="e.g., Desktop Computer"
                  />
                </div>

                <div>
                  <label className="block mb-2">
                    Description <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="text"
                    value={item.description}
                    onChange={(e) =>
                      updateItem(item.id, "description", e.target.value)
                    }
                    required
                    className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    placeholder="Brief description"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block mb-2">Technical Specifications</label>
                  <textarea
                    value={item.technicalSpecs}
                    onChange={(e) =>
                      updateItem(item.id, "technicalSpecs", e.target.value)
                    }
                    rows={3}
                    className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 resize-none"
                    placeholder="Brand, model, standards, compliance details"
                  />
                </div>

                <div>
                  <label className="block mb-2">
                    Quantity <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="number"
                    value={item.quantity}
                    onChange={(e) =>
                      updateItem(item.id, "quantity", e.target.value)
                    }
                    required
                    min="1"
                    className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    placeholder="Enter quantity"
                  />
                </div>

                <div>
                  <label className="block mb-2">
                    Unit of Measurement <span className="text-red-600">*</span>
                  </label>
                  <select
                    value={item.unit}
                    onChange={(e) =>
                      updateItem(item.id, "unit", e.target.value)
                    }
                    required
                    className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  >
                    <option value="Nos">Nos (Numbers)</option>
                    <option value="Kg">Kg (Kilogram)</option>
                    <option value="Litre">Litre</option>
                    <option value="Set">Set</option>
                    <option value="Box">Box</option>
                    <option value="Meter">Meter</option>
                    <option value="Pack">Pack</option>
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block mb-2">
                    Quality / Compliance Requirements
                  </label>
                  <input
                    type="text"
                    value={item.qualityRequirements}
                    onChange={(e) =>
                      updateItem(item.id, "qualityRequirements", e.target.value)
                    }
                    className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    placeholder="e.g., ISO certified, BIS standard, 3-year warranty"
                  />
                </div>
              </div>
            </div>
          ))}

          <button
            type="button"
            onClick={addItem}
            className="w-full py-3 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors flex items-center justify-center gap-2 text-gray-600 hover:text-blue-600"
          >
            <Plus className="w-5 h-5" />
            Add Another Item
          </button>
        </div>
      </FormSection>

      <div className="bg-white rounded-lg shadow-lg p-6 sticky bottom-4">
        <div className="flex justify-end">
          <button
            type="button"
            onClick={handleSubmit}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
          >
            <Send className="w-4 h-4" />
            Publish Quotation Request
          </button>
        </div>
      </div>
    </div>
  );
}
