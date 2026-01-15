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

export interface MonthlyTrend {
  month: string;
  expenses: number;
  quotations: number;
  approved: number;
}

export interface ExpenseCategory {
  category: string;
  amount: number;
  color: string;
  percentage: number;
}

export interface QuotationStatus {
  status: string;
  count: number;
  value: number;
  color: string;
}

export interface RecentExpense {
  item: string;
  category: string;
  date: string;
  amount: number;
  vendor: string;
}

export interface PendingQuotation {
  item: string;
  vendor: string;
  amount: number;
  requestDate: string;
  status: string;
}