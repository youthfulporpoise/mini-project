// app/hod/layout.tsx
import { Sidebar } from "@/app/components/Sidebar";
import { MenuItem } from "../utility/index";
import { fetchQuotations, fetchResponses } from "../utility/api";

const responseCount = await fetchResponses();
const qtCount = await fetchQuotations();
const menuItems: MenuItem[] = [
  { id: 1, icon: "Home", label: "Overview", href: "/hod" },
  {
    id: 2,
    icon: "FileText",
    label: "Quotations",
    href: "/hod/quotations",
    badge: qtCount ? qtCount.length : 0,
  },
  {
    id: 3,
    icon: "MessageSquare",
    label: "Responses",
    href: "/hod/responses",
    badge: responseCount ? responseCount.length : 0,
  },
  {
    id: 4,
    icon: "IdCard",
    label: "OTP Verification",
    href: "/hod/otp_verify",
  },
];

export default function HodLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#F2F2F2" }}>
      <Sidebar menuItems={menuItems} />
      <main style={{ flex: 1, marginLeft: 232 }}>{children}</main>
    </div>
  );
}
