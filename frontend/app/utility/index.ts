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


export interface QuotationRequestForm {
  client_id: string;
  quotation_id: string;
  requirements: string;
  status: "Pending" | "Approved" | "Rejected" | "Under Review";
  product_category: string;
  created_date: string;
  approved_amount?: number;
}

export interface Quotation {
  id: number;
  category: string;
  title: string;
  department: string;
  description: string;
  submission_deadline: string;
  delivery_period : string; 
  amount: number;
  approved: boolean;
  status: number;
}


// // Quotations 
// export interface Quotations {
//   amount
// : 
// 50000
// approved
// : 
// false
// department
// : 
// "Electronics and Communication Engineering"
// description
// : 
// "(1) Raspberry Pi Zero 200 No.\r\nrefurbished Raspberry Pi Zeroes without any mechanical, electronic, or apparent are acceptable"
// id
// : 
// 1
// status
// : 
// 0
// submission_deadline
// : 
// "2026-06-25T00:00:00Z"
// title
// : 
// "Purcha
// }