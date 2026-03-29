// app/hod/layout.tsx
import { Sidebar } from "@/app/components/Sidebar";
import { MenuItem } from "@/app/utility/index";
import React from "react";

const menuItems: MenuItem[] = [
  { id: 1, icon: "Home", label: "Dashboard", href: "/vendor" },
  { id: 2, icon: "MessageSquare", label: "Responses", href: "/vendor/responses" },
 
];

export default function VendorLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#F2F2F2" }}>
      <Sidebar menuItems={menuItems} />
      <main style={{ flex: 1, marginLeft: 232 }}>{children}</main>
    </div>
  );
}