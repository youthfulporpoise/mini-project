"use client";
import { Users, MessageSquare, BarChart3 } from "lucide-react";
import Link from "next/link";
import { menuItem } from "../../utility/index";

const menuItems: menuItem[] = [
  { id: 6, icon: Users, label: "Request", active: true },
  { id: 7, icon: MessageSquare, label: "Responses", active: false },
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
              <Link href={`/Vendor/${item.label}`}>
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
