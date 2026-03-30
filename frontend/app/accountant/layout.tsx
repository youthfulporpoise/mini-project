// app/hod/layout.tsx
import { Sidebar } from "@/app/components/Sidebar";
import { MenuItem } from "@/app/utility/index";

const menuItems: MenuItem[] = [
  { id: 1, icon: "Home", label: "Dashboard", href: "/accountant" },
  { id: 2, icon: "Wallet", label: "Payments", href: "/accountant/payments" },
  { id: 3, icon: "History", label: "Transactions", href: "/accountant/transactions" },
 
];

export default function AccountantLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#F2F2F2" }}>
      <Sidebar menuItems={menuItems} />
      <main style={{ flex: 1, marginLeft: 232 }}>{children}</main>
    </div>
  );
}