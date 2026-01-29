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
import { BACKEND_URL } from "../utility";
import axios from "axios";

interface QuotationItem {
  id: string;
  itemName: string;
  itemDescription: string;
  amount: number;
}

interface QuotationFormData {
  id: string;
  category: string;
  quotationTitle: string;
  description: string;
  department: string;
  submissionDeadline: string;
  status: 0 | 1 | 2;
  deliveryPeriod: number;
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
  const [expandedSections, setExpandedSections] = useState({
    basic: true,
    items: true,
  });

  const [formData, setFormData] = useState<QuotationFormData>({
    id: "",
    category: "",
    quotationTitle: "",
    description: "",
    department: "",
    submissionDeadline: "",
    deliveryPeriod: 0,
    status: 0,
    items: [
      {
        id: "",
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
      id: "",
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

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  try {
    // Camel Case to Snake Case conversion
    const backendData = {
      id: formData.id,
      category: formData.category,
      title: formData.quotationTitle,
      description: formData.description,
      department: formData.department,
      submission_deadline: formData.submissionDeadline,
      delivery_period: formData.deliveryPeriod,
      status: formData.status,
      items: formData.items.map((item) => ({
        id: item.id,
        name: item.itemName,
        description: item.itemDescription,
        amount: item.amount,
      })),
    };
    
         const options = {
        headers: {
          "Content-Type": "application/json",
        },
      };
    const response = await axios.post(`${BACKEND_URL}/qt/`, backendData, options);
    console.log("Response:", response.data);

    setStatus("published");
    
  
    setTimeout(() => {
      setStatus(null);
      
      // Reset form data to initial state
      setFormData({
        id: "",
        category: "",
        quotationTitle: "",
        description: "",
        department: "",
        submissionDeadline: "",
        deliveryPeriod: 0,
        status: 0,
        items: [
          {
            id: "1",
            itemName: "",
            itemDescription: "",
            amount: 0,
          },
        ],
      });
      
      // Reset sections to expanded
      setExpandedSections({
        basic: true,
        items: true,
      });
    }, 3000);
    
  } catch (error) {
    console.error("Error:", error);
    alert("Failed to submit quotation. Please try again.");
  }
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
            Quotation ID: <strong>{formData.id}</strong>
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
          <div className="md:col-span-2">
            <label className="block mb-2">
              Quotation Title <span className="text-red-600">*</span>
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
              Department <span className="text-red-600">*</span>
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
              Category
              <span className="text-red-600">*</span>
            </label>
            <input
              name="category"
              value={formData.category}
              onChange={handleChange}
              placeholder="eg., Software, Lab"
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
              type="date"
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
          <div className="md:col-span-2">
            <label className="block mb-2">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={3}
              className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 resize-none"
              placeholder="Quotation details"
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

                <div className="md:col-span-2">
                  <label className="block mb-2">Description</label>
                  <textarea
                    value={item.itemDescription}
                    onChange={(e) =>
                      updateItem(item.id, "itemDescription", e.target.value)
                    }
                    rows={3}
                    className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 resize-none"
                    placeholder="Brand, model, standards, compliance details"
                  />
                </div>
                <div className="w-full max-w-md">
                  <label className="block mb-2 text-gray-700 font-medium">
                    Amount <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="number"
                    value={item.amount}
                    onChange={(e) =>
                      updateItem(item.id, "amount", e.target.value)
                    }
                    required
                    min="1"
                    className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    placeholder="Enter Amount"
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
