import { LucideProps } from "lucide-react";
import { ForwardRefExoticComponent, RefAttributes } from "react";

// Sidebar
export interface menuItem {
  id: number;
  icon: ForwardRefExoticComponent<
    Omit<LucideProps, "ref"> & RefAttributes<SVGSVGElement>
  >;
  label: string;
  active: boolean;
}

// Dashboard

export interface QuotationRequest {
  client_id: string;
  quotation_id: string;
  requirements: string;
  status: "Pending" | "Approved" | "Rejected" | "Under Review";
  product_category: string;
  created_date: string;
  approved_amount?: number;
}

export interface VendorResponse {
  vendor_id: string;
  quotation_id: string;
  vendor_name: string;
  description: string;
  amount: number;
  submitted_date: string;
}

export interface Transaction {
  transaction_id: string;
  quotation_id: string;
  payment_status: "Paid" | "Pending" | "Processing" | "Failed";
  amount: number;
  transaction_date: string;
  vendor_name: string;
}

export interface QuotationRequestForm {
  client_id: string;
  quotation_id: string;
  requirements: string;
  status: "Pending" | "Approved" | "Rejected" | "Under Review";
  product_category: string;
  created_date: string;
  approved_amount?: number;
}

// Quotations
export interface QuotationItems {
  id: string;
  itemName: string;
  itemDescription: string;
  amount: number;
}

export interface Quotation {
  id: string;
  category: string;
  quotationTitle: string;
  description: string;
  department: string;
  submissionDeadline: string;
  status: "PENDING" | "APPROVED" | "REJECTED" | "DELIVERED";
  deliveryPeriod: number;
  items: QuotationItems[];
  // new fields
  qtReqVerifiedAccountant: boolean | false;
  finalQtVerifiedAccountant: boolean | false;
  qtVerifiedPrincipal: boolean | false;
}

//Vendors

export interface VendorResponseFormProps {
  quotationItems: Array<{
    id: string;
    itemName: string;
    itemDescription: string;
    amount: number;
  }>;
  setSubmittedResponse: (response: VendorResponseItem[]) => void;
}

export interface VendorResponseItemDetail {
  item: string;
  brandModel: string;
  unitPrice: number;
  description: string;
  deliveryPeriod: string;
}

export interface VendorResponseItem {
  id: string;
  quotation: string;
  vendor: number;
  responseItems: VendorResponseItemDetail[];
}

export interface LoginResponse {
  id: string;
  username: string;
  role: string;
}

export interface userProfile {
  id: number;
  name: string;
  email: string;
  phone: number;
  role: string;
}
