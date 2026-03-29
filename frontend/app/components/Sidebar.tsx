"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { redirect, RedirectType, usePathname } from "next/navigation";
import Cookies from "js-cookie";
import { LogOut, PanelLeftClose, PanelLeftOpen } from "lucide-react";
import * as LucideIcons from "lucide-react";
import { menuItem } from "../utility/index";
import { performLogout } from "../utility/api";
import { useRouter } from "next/navigation";

interface SidebarProps {
  menuItems: menuItem[];
}

export function Sidebar({ menuItems }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [userProfile, setUserProfile] = useState<any>(null);
  const pathname = usePathname();
  useEffect(() => {
    try {
      const cookieData = Cookies.get("userProfile");
      if (cookieData) {
        setUserProfile(JSON.parse(decodeURIComponent(cookieData)));
      }
    } catch (e) {
      console.error("Failed to parse user profile cookie in Sidebar", e);
    }
  }, []);

  // Helper to get initials
  const getInitials = (name: string) => {
    if (!name) return "U";
    return name.charAt(0).toUpperCase();
  };

  const handleLogout = async () => {
    const result = await performLogout();

    if (result.success) {
      console.log("Successful Logout");
    } else {
      console.error("Logout failed on backend, forcing local logout.");
    }

    // Always redirect to login, even if the backend call fails
    redirect("/auth", RedirectType.replace);
  };

  const isActive = (href: string) =>
    href === "/hod" ? pathname === href : pathname.startsWith(href);

  return (
    <aside
      className={`fixed bottom-0 left-0 top-0 z-50 flex flex-col border-r border-white/5 bg-[#111110] font-sans transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] ${
        collapsed ? "w-[68px]" : "w-[232px]"
      }`}
    >
      {/* ── Brand Header ── */}
      <div
        className={`flex h-16 shrink-0 items-center overflow-hidden border-b border-white/5 ${
          collapsed ? "justify-center px-0" : "gap-2.5 px-4"
        }`}
      >
        {!collapsed && (
          <>
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] bg-[#FB4D27]">
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="white"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M21.21 15.89A10 10 0 1 1 8 2.83" />
                <path d="M22 12A10 10 0 0 0 12 2v10z" />
              </svg>
            </div>
            <span className="whitespace-nowrap text-[17px] font-bold tracking-[-0.03em] text-white">
              Q<span className="text-[#FB4D27]">M</span>S
            </span>
          </>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-white/35 transition-colors hover:bg-white/5 hover:text-white ${
            !collapsed && "ml-auto"
          }`}
          aria-label="Toggle sidebar"
        >
          {collapsed ? (
            <PanelLeftOpen size={15} />
          ) : (
            <PanelLeftClose size={15} />
          )}
        </button>
      </div>

      {/* ── Navigation Content ── */}
      <nav className="scrollbar-none flex flex-1 flex-col gap-1 overflow-y-auto overflow-x-hidden p-2.5">
        {!collapsed && (
          <div className="whitespace-nowrap px-2 pb-1.5 font-mono text-[9px] font-medium uppercase tracking-[0.12em] text-white/20 transition-opacity duration-200">
            Navigation
          </div>
        )}

        {menuItems?.map((item) => {
          const IconComponent = (LucideIcons[
            item.icon as keyof typeof LucideIcons
          ] || LucideIcons.HelpCircle) as React.ElementType;

          const active = isActive(item.href);

          return (
            <Link
              key={item.id}
              href={item.href}
              className={`group relative flex h-10 w-full items-center rounded-[10px] transition-colors ${
                collapsed ? "justify-center px-0" : "gap-2.5 px-2.5"
              } ${
                active
                  ? "bg-[#FB4D27]/12 text-white before:absolute before:left-0 before:top-1/2 before:h-5 before:w-[3px] before:-translate-y-1/2 before:rounded-r-sm before:bg-[#FB4D27]"
                  : "text-white/45 hover:bg-white/5 hover:text-white"
              }`}
            >
              <IconComponent
                className={`h-[18px] w-[18px] shrink-0 ${
                  active ? "text-[#FB4D27]" : ""
                }`}
              />

              {!collapsed && (
                <span className="flex-1 truncate text-left text-[13.5px] font-medium transition-opacity">
                  {item.label}
                </span>
              )}

              {!collapsed && item.badge && (
                <span className="shrink-0 rounded-full bg-[#FB4D27]/20 px-1.5 py-0.5 font-mono text-[10px] font-medium text-[#FB4D27]">
                  {item.badge}
                </span>
              )}

              {/* Tooltip for collapsed state */}
              {collapsed && (
                <span className="absolute left-[calc(100%+12px)] top-1/2 z-[100] hidden -translate-y-1/2 whitespace-nowrap rounded-md bg-[#2a2826] px-2.5 py-1.5 text-xs font-medium text-white shadow-[0_4px_16px_rgba(0,0,0,0.4)] group-hover:block">
                  {item.label}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* ── User Footer ── */}
      <div
        className={`flex shrink-0 flex-col border-t border-white/5 ${
          collapsed ? "items-center p-2" : "p-2.5"
        }`}
      >
        <div
          className={`flex cursor-pointer items-center overflow-hidden rounded-[10px] transition-colors hover:bg-white/5 ${
            collapsed ? "justify-center p-1" : "gap-2.5 p-2"
          }`}
        >
          <div className="flex h-[30px] w-[30px] shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-[#FB4D27] to-[#4C433F] text-xs font-bold text-white">
            {getInitials(userProfile?.name)}
          </div>

          {!collapsed && (
            <div className="flex flex-1 flex-col overflow-hidden">
              <span className="truncate text-[13px] font-semibold capitalize text-white">
                {userProfile?.name || "Loading..."}
              </span>
              <span className="truncate font-mono text-[10px] uppercase tracking-[0.05em] text-white/30">
                {userProfile?.role || "USER"}
              </span>
            </div>
          )}
        </div>

        {!collapsed && <div className="my-2 h-px bg-white/5" />}

        <button
          onClick={handleLogout}
          className={`group relative flex w-full items-center rounded-[10px] text-[13px] font-medium text-white/30 transition-colors hover:bg-[#FB4D27]/10 hover:text-[#FB4D27] ${
            collapsed ? "mt-2 justify-center p-2" : "gap-2.5 p-2"
          }`}
        >
          <LogOut className="h-[15px] w-[15px] shrink-0" />

          {!collapsed && <span>Sign out</span>}

          {/* Tooltip for collapsed state */}
          {collapsed && (
            <span className="absolute left-[calc(100%+12px)] top-1/2 z-[100] hidden -translate-y-1/2 whitespace-nowrap rounded-md bg-[#2a2826] px-2.5 py-1.5 text-xs font-medium text-white shadow-[0_4px_16px_rgba(0,0,0,0.4)] group-hover:block">
              Sign out
            </span>
          )}
        </button>
      </div>
    </aside>
  );
}
