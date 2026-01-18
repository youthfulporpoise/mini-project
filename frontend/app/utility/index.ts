import { LucideProps } from "lucide-react";
import { ForwardRefExoticComponent, RefAttributes } from "react";

// Sidebar 
export interface menuItem {
    id : number; 
    icon : ForwardRefExoticComponent<Omit<LucideProps, "ref"> & RefAttributes<SVGSVGElement>>; 
    label : string; 
    active : boolean; 

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