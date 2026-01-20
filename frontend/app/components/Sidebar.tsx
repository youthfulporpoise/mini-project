"use client";
import {
  Home,
  Users,
  Settings,
  FileText,
  Package,
  CreditCard,
  UserPlus,
  MessageSquare,
  DollarSign,
  BarChart3,
} from "lucide-react";
import Link from "next/link";
import { menuItem } from "../utility";

const menuItems: menuItem[]  = [
  { id: 1, icon: Home, label: "Overview", active: true },
  { id: 2, icon: FileText, label: "Quotations", active: false },
  { id: 3, icon: UserPlus, label: "Registration", active: false },
  { id: 4, icon: CreditCard, label: "Transactions", active: false },
  { id: 5, icon: DollarSign, label: "Expenses", active: false },
  { id: 6, icon: Users, label: "Vendor Requests", active: false },
  { id: 7, icon: MessageSquare, label: "Responses", active: false },
  { id: 8, icon: Package, label: "Products", active: false },
  { id: 9, icon: Settings, label: "Settings", active: false },
];

export function Sidebar() {
  return (
    <aside className="w-64 bg-gray-900 text-white p-6 h-screen min-h-fit overflow-hidden ">
      <div className="mb-8 ">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
            <BarChart3 className="w-6 h-6" />
          </div>
          <span className="text-xl font-bold">QMS</span>
        </div>
      </div>
      <ul className="space-y-2 list-none">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <li key={item.id}>
              <Link href={`/${item.label}`}>
                <button
                  type="button"
                  key={item.label}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    item.active
                      ? "bg-blue-600 text-white"
                      : "text-gray-300 hover:bg-gray-800 hover:text-white"
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                </button>
              </Link>
            </li>
          );
        })}
      </ul>
    </aside>
  );
}
