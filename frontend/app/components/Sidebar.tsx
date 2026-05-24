"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { redirect, RedirectType, usePathname } from "next/navigation";
import Cookies from "js-cookie";
import { LogOut, PanelLeftClose, PanelLeftOpen } from "lucide-react";
import * as LucideIcons from "lucide-react";
import { menuItem } from "../utility/index";
import { performLogout } from "../utility/api";

interface SidebarProps {
  menuItems: menuItem[];
}

export function Sidebar({ menuItems }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [clickedItem, setClickedItem] = useState<number | null>(null);
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
    redirect("/auth", RedirectType.replace);
  };

  const isActive = (href: string) =>
    href === "/hod" ? pathname === href : pathname.startsWith(href);

  const handleClick = (index: number) => {
    setClickedItem(index);
    setTimeout(() => setClickedItem(null), 600);
  };

  return (
    <>
      <style>{`
        @keyframes waveSlide {
          0% { transform: scaleX(0); transform-origin: left; }
          100% { transform: scaleX(1); transform-origin: left; }
        }
        .animate-wave {
          animation: waveSlide 0.4s ease-out forwards;
        }
      `}</style>

      <aside
        className={`fixed bottom-0 left-0 top-0 z-50 flex flex-col border-r border-gray-100 bg-white font-sans transition-all duration-300 ease-in-out ${
          collapsed ? "w-[72px]" : "w-[240px]"
        }`}
      >
        {/* ── Brand Header ── */}
        <div
          className={`flex h-[72px] shrink-0 items-center border-b border-gray-50 ${
            collapsed ? "justify-center px-0" : "gap-3 px-4"
          }`}
        >
          {!collapsed && (
            <>
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#111110]">
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
              <span  className="whitespace-nowrap text-[16px] font-bold tracking-[-0.02em] text-[#111110]">
                Q<span className="text-[#FB4D27]">MS</span>
              </span>
            </>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-gray-400 transition-colors hover:bg-gray-50 hover:text-gray-700 ${
              !collapsed && "ml-auto"
            }`}
            aria-label="Toggle sidebar"
          >
            {collapsed ? (
              <PanelLeftOpen size={16} />
            ) : (
              <PanelLeftClose size={16} />
            )}
          </button>
        </div>

        {/* ── Navigation Content ── */}
        <nav className="scrollbar-none flex flex-1 flex-col gap-1 overflow-y-auto px-2.5 py-3">
          {menuItems?.map((item, index) => {
            const IconComponent = (LucideIcons[
              item.icon as keyof typeof LucideIcons
            ] || LucideIcons.HelpCircle) as React.ElementType;

            const active = isActive(item.href);

            return (
              <Link
                key={item.id}
                href={item.href}
                onClick={() => handleClick(index)}
                className={`group relative flex h-10 w-full items-center overflow-hidden rounded-lg transition-all duration-200 ${
                  collapsed ? "justify-center px-0" : "gap-2.5 px-2.5"
                } ${
                  active
                    ? "bg-gray-50 text-[#FB4D27]"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                }`}
              >
                {/* Wave animation overlay */}
                {clickedItem === index && (
                  <div className="absolute inset-0 bg-gray-100 animate-wave" />
                )}

                <IconComponent
                  className={`relative z-10 h-[18px] w-[18px] shrink-0 ${
                    active ? "text-[#FB4D27]" : ""
                  }`}
                />

                {!collapsed && (
                  <span className="relative z-10 flex-1 truncate text-left text-[13.5px] font-medium">
                    {item.label}
                  </span>
                )}

                {!collapsed && item.badge && (
                  <span className="relative z-10 shrink-0 rounded-full bg-gray-100 px-1.5 py-0.5 font-mono text-[9px] font-medium text-gray-600">
                    {item.badge}
                  </span>
                )}

                {collapsed && (
                  <span className="absolute left-[calc(100%+12px)] top-1/2 z-[100] hidden -translate-y-1/2 whitespace-nowrap rounded-md bg-gray-900 px-2.5 py-1.5 text-xs font-medium text-white shadow-lg group-hover:block">
                    {item.label}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* ── User Footer ── */}
        <div className="flex shrink-0 flex-col border-t border-gray-100 bg-gradient-to-b from-white to-gray-50/50 p-3">
          {!collapsed && (
            <div className="mb-3 flex items-center gap-3 rounded-xl bg-white p-3 shadow-[0_2px_12px_rgba(0,0,0,0.04)] ring-1 ring-gray-100">
              <div className="relative">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-gray-700 to-gray-900 text-sm font-bold text-white shadow-md">
                  {getInitials(userProfile?.name)}
                </div>
                <div className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-green-500 ring-2 ring-white" />
              </div>
              <div className="flex-1 overflow-hidden">
                <span className="block truncate text-[13px] font-semibold text-gray-900">
                  {userProfile?.name || "Loading..."}
                </span>
                <span className="inline-block rounded-full bg-gray-100 px-2 py-0.5 text-[9px] font-medium uppercase tracking-[0.05em] text-gray-600">
                  {userProfile?.role || "User"}
                </span>
              </div>
            </div>
          )}

          <button
            onClick={handleLogout}
            className={`group relative flex items-center justify-center overflow-hidden rounded-xl text-[13px] font-medium transition-all duration-300 ${
              collapsed
                ? "h-10 w-10 text-gray-400 hover:bg-red-50 hover:text-red-500"
                : "w-full gap-2.5 bg-white p-3 text-gray-600 shadow-[0_2px_8px_rgba(0,0,0,0.04)] ring-1 ring-gray-100 hover:bg-gradient-to-r hover:from-red-50 hover:to-red-50/50 hover:text-red-500 hover:shadow-[0_4px_12px_rgba(239,68,68,0.15)] hover:ring-1 hover:ring-red-200"
            }`}
          >
            <LogOut className="h-[17px] w-[17px] shrink-0 transition-transform duration-300 group-hover:-translate-x-0.5" />
            {!collapsed && (
              <span className="relative z-10">Sign out</span>
            )}
            {collapsed && (
              <span className="absolute left-[calc(100%+12px)] top-1/2 z-[100] hidden -translate-y-1/2 whitespace-nowrap rounded-md bg-gray-900 px-2.5 py-1.5 text-xs font-medium text-white shadow-lg group-hover:block">
                Sign out
              </span>
            )}
          </button>
        </div>
      </aside>
    </>
  );
}
