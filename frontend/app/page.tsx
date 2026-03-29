"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

// ─── Feature card ─────────────────────────────────────────────────────────────
function FeatureCard({
  icon,
  title,
  desc,
  index,
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
  index: number;
}) {
  return (
    <div
      className="group bg-white p-8 transition-colors duration-250 hover:bg-[#F2F2F2] animate-fade-slide-up"
      style={{ animationDelay: `${index * 120}ms` }}
    >
      <div className="mb-[18px] flex h-11 w-11 items-center justify-center rounded-[10px] bg-[#F2F2F2] text-[#FB4D27] transition-colors duration-250 group-hover:bg-[#FB4D27] group-hover:text-white">
        {icon}
      </div>
      <h3 className="mb-2 text-base font-semibold tracking-[-0.01em] text-[#111110]">
        {title}
      </h3>
      <p className="text-sm leading-[1.6] text-[#4C433F]">{desc}</p>
    </div>
  );
}

// ─── Role badge ───────────────────────────────────────────────────────────────
function RoleBadge({ role, color }: { role: string; color: string }) {
  return (
    <span
      className="rounded-full border-[1.5px] px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.05em]"
      style={{ borderColor: color, color }}
    >
      {role}
    </span>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function App() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const features = [
    {
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
          <line x1="16" y1="13" x2="8" y2="13" />
          <line x1="16" y1="17" x2="8" y2="17" />
          <polyline points="10 9 9 9 8 9" />
        </svg>
      ),
      title: "Quotation Lifecycle",
      desc: "End-to-end management from HOD request to vendor delivery — no paperwork, no delays.",
    },
    {
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      ),
      title: "Multi-Role Access",
      desc: "Separate portals for HOD, Accountant, Principal, and Vendors with granular permissions.",
    },
    {
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
          <line x1="1" y1="10" x2="23" y2="10" />
        </svg>
      ),
      title: "Secure Payments",
      desc: "Razorpay-integrated payment gateway with OTP delivery confirmation before any transaction.",
    },
    {
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <line x1="18" y1="20" x2="18" y2="10" />
          <line x1="12" y1="20" x2="12" y2="4" />
          <line x1="6" y1="20" x2="6" y2="14" />
        </svg>
      ),
      title: "Expense Analytics",
      desc: "Visual breakdowns of procurement spend by category, department, and time period.",
    },
    {
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        </svg>
      ),
      title: "OTP Verification",
      desc: "Cryptographic delivery confirmation — payment only releases when goods are received.",
    },
    {
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
        </svg>
      ),
      title: "Audit Trails",
      desc: "Every action logged and archived — complete visibility for compliance and reporting.",
    },
  ];

  const steps = [
    { num: "01", title: "HOD Creates Request", desc: "Department head submits a quotation request with item specifications and budget details." },
    { num: "02", title: "Accountant Verifies", desc: "Accountant reviews and forwards the verified request to registered vendors." },
    { num: "03", title: "Vendors Respond", desc: "Vendors submit competitive quotations with pricing and delivery terms." },
    { num: "04", title: "Principal Approves", desc: "Selected quotation is reviewed and approved by the Principal." },
    { num: "05", title: "Delivery + OTP", desc: "Vendor delivers goods; HOD confirms receipt via OTP before payment is released." },
    { num: "06", title: "Payment & Archive", desc: "Secure payment processed, transaction archived for expense analysis." },
  ];

  return (
    <div className="font-sans text-[#111110] bg-[#F2F2F2] antialiased overflow-x-hidden [&::-webkit-scrollbar]:w-[6px] [&::-webkit-scrollbar-track]:bg-[#F2F2F2] [&::-webkit-scrollbar-thumb]:bg-[#D3D6DA] [&::-webkit-scrollbar-thumb]:rounded-[3px]">
      
      {/* ── Keyframes & Utilities ── */}
      <style>{`
        @keyframes blobFloat {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -20px) scale(1.05); }
          66% { transform: translate(-20px, 15px) scale(0.97); }
        }
        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(24px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-slide-up { animation: fadeSlideUp 0.6s cubic-bezier(0.22, 1, 0.36, 1) both; }
        .animate-blob-1 { animation: blobFloat 8s ease-in-out infinite; }
        .animate-blob-2 { animation: blobFloat 10s ease-in-out infinite reverse; }
        html { scroll-behavior: smooth; }
      `}</style>

      {/* ── Nav ── */}
      <nav className={`fixed left-0 right-0 top-0 z-[100] flex h-[68px] items-center px-[clamp(20px,5vw,64px)] transition-all duration-400 ease-[cubic-bezier(0.22,1,0.36,1)] ${scrolled ? "bg-[#F2F2F2]/90 backdrop-blur-[16px] shadow-[0_1px_0_rgba(0,0,0,0.08)]" : ""}`}>
        <div className="mx-auto flex w-full max-w-[1280px] items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 no-underline">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] bg-[#111110]">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21.21 15.89A10 10 0 1 1 8 2.83" />
                <path d="M22 12A10 10 0 0 0 12 2v10z" />
              </svg>
            </div>
            <span className="font-sans text-[17px] font-bold tracking-[-0.02em] text-[#111110]">
              Q<span className="text-[#FB4D27]">M</span>S
            </span>
          </Link>

          <ul className="hidden items-center gap-8 list-none lg:flex">
            <li><a href="#features" className="text-sm font-medium text-[#4C433F] transition-colors duration-200 hover:text-[#111110]">Features</a></li>
            <li><a href="#workflow" className="text-sm font-medium text-[#4C433F] transition-colors duration-200 hover:text-[#111110]">How it works</a></li>
            <li><a href="#roles" className="text-sm font-medium text-[#4C433F] transition-colors duration-200 hover:text-[#111110]">Roles</a></li>
          </ul>

          <div className="flex items-center gap-3">
            <Link href="/login" className="hidden rounded-lg px-4 py-2 text-sm font-medium text-[#4C433F] transition-colors hover:bg-black/5 hover:text-[#111110] lg:inline-block">
              Sign in
            </Link>
            <Link href="/registration" className="hidden rounded-lg bg-[#111110] px-[22px] py-2.5 text-sm font-semibold text-white transition-all duration-250 hover:-translate-y-[1px] hover:bg-[#FB4D27] active:translate-y-0 lg:inline-block">
              Get started
            </Link>

            {/* Mobile Menu Toggle */}
            <button
              className="flex flex-col gap-[5px] p-1.5 lg:hidden"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Menu"
            >
              <span className={`block h-[2px] w-[22px] rounded-sm bg-[#111110] transition-transform duration-300 ${menuOpen ? "translate-y-[7px] rotate-45" : ""}`} />
              <span className={`block h-[2px] w-[22px] rounded-sm bg-[#111110] transition-opacity duration-300 ${menuOpen ? "opacity-0" : "opacity-100"}`} />
              <span className={`block h-[2px] w-[22px] rounded-sm bg-[#111110] transition-transform duration-300 ${menuOpen ? "-translate-y-[7px] -rotate-45" : ""}`} />
            </button>
          </div>
        </div>
      </nav>

      {/* ── Mobile Drawer ── */}
      <div className={`fixed inset-0 z-[99] flex-col gap-2 bg-[#F2F2F2] px-6 pb-6 pt-[92px] lg:hidden ${menuOpen ? "flex" : "hidden"}`}>
        <a href="#features" onClick={() => setMenuOpen(false)} className="border-b border-black/5 py-3.5 text-lg font-medium text-[#111110]">Features</a>
        <a href="#workflow" onClick={() => setMenuOpen(false)} className="border-b border-black/5 py-3.5 text-lg font-medium text-[#111110]">How it works</a>
        <a href="#roles" onClick={() => setMenuOpen(false)} className="border-b border-black/5 py-3.5 text-lg font-medium text-[#111110]">Roles</a>
        
        <div className="mt-4 flex flex-col gap-2.5">
          <Link href="/login" onClick={() => setMenuOpen(false)} className="inline-flex items-center justify-center gap-2 rounded-lg border-[1.5px] border-black/20 bg-transparent px-[22px] py-2.5 text-sm font-medium text-[#111110] transition-all hover:-translate-y-[1px] hover:bg-[#111110] hover:text-white">
            Sign in
          </Link>
          <Link href="/registration" onClick={() => setMenuOpen(false)} className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#FB4D27] px-7 py-3.5 text-[15px] font-semibold text-white shadow-[0_4px_20px_rgba(251,77,39,0.35)] transition-all hover:-translate-y-[2px] hover:bg-[#e83d18] hover:shadow-[0_8px_30px_rgba(251,77,39,0.45)]">
            Get started
          </Link>
        </div>
      </div>

      {/* ── Hero ── */}
      <section className="relative flex min-h-screen flex-col overflow-hidden pt-[68px]">
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="animate-blob-1 absolute -right-[100px] -top-[200px] h-[600px] w-[600px] rounded-full bg-[radial-gradient(circle,_#FB4D27_0%,_transparent_70%)] opacity-35 blur-[80px]" />
          <div className="animate-blob-2 absolute -left-[100px] bottom-0 h-[400px] w-[400px] rounded-full bg-[radial-gradient(circle,_#D3D6DA_0%,_transparent_70%)] opacity-35 blur-[80px]" />
          <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.04)_1px,transparent_1px)] bg-[size:48px_48px] [mask-image:radial-gradient(ellipse_80%_80%_at_50%_50%,black_30%,transparent_100%)]" />
        </div>

        <div className="relative z-10 mx-auto flex w-full max-w-[1280px] flex-1 flex-col justify-center gap-14 px-[clamp(20px,5vw,64px)] py-[clamp(48px,8vh,100px)]">
          <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2">
            
            {/* Left */}
            <div className="flex flex-col gap-7">
              <div className="animate-fade-slide-up inline-flex w-fit items-center gap-2 rounded-full border border-[#FB4D27]/25 bg-[#FB4D27]/12 px-3.5 py-1.5 text-xs font-semibold uppercase tracking-[0.06em] text-[#FB4D27]">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
                Secure Institutional Procurement
              </div>

              <h1 className="animate-fade-slide-up text-[clamp(42px,8vw,56px)] font-bold leading-[1.04] tracking-[-0.03em] text-[#111110] lg:text-[clamp(42px,5.5vw,72px)]" style={{ animationDelay: '100ms' }}>
                Smarter
                <br />
                <span className="text-[#FB4D27]">Quotation</span>
                <br />
                <span className="font-light text-[#929090]">Management</span>
              </h1>

              <p className="animate-fade-slide-up max-w-[420px] text-[17px] font-normal leading-[1.65] text-[#4C433F]" style={{ animationDelay: '200ms' }}>
                The all-in-one platform for managing vendors, tracking expenses,
                and streamlining quotation approvals — built for government institutions.
              </p>

              <div className="animate-fade-slide-up flex flex-wrap items-center gap-3.5" style={{ animationDelay: '300ms' }}>
                <Link href="/registration" className="inline-flex items-center gap-2 rounded-lg bg-[#FB4D27] px-7 py-3.5 text-[15px] font-semibold text-white shadow-[0_4px_20px_rgba(251,77,39,0.35)] transition-all duration-250 hover:-translate-y-0.5 hover:bg-[#e83d18] hover:shadow-[0_8px_30px_rgba(251,77,39,0.45)] active:translate-y-0">
                  Get started free
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="5" y1="12" x2="19" y2="12" />
                    <polyline points="12 5 19 12 12 19" />
                  </svg>
                </Link>
                <Link href="/login" className="inline-flex items-center gap-2 rounded-lg border-[1.5px] border-black/15 bg-transparent px-6 py-[13px] text-[15px] font-medium text-[#111110] transition-all duration-250 hover:-translate-y-[1px] hover:border-[#111110] hover:bg-[#111110] hover:text-white">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" />
                    <polygon points="10 8 16 12 10 16 10 8" />
                  </svg>
                  Sign in
                </Link>
              </div>

              <div className="animate-fade-slide-up flex flex-wrap items-center gap-2" style={{ animationDelay: '400ms' }}>
                <span className="text-xs font-medium tracking-[0.03em] text-[#929090]">Roles:</span>
                <RoleBadge role="HOD" color="#FB4D27" />
                <RoleBadge role="Accountant" color="#929090" />
                <RoleBadge role="Principal" color="#4C433F" />
                <RoleBadge role="Vendor" color="#5B7FA6" />
              </div>
            </div>

            {/* Right — Dashboard Mockup */}
            <div className="animate-fade-slide-up flex justify-center lg:justify-end" style={{ animationDelay: '200ms' }}>
              <div className="w-full max-w-[560px] overflow-hidden rounded-[20px] border border-black/10 bg-white shadow-[0_24px_80px_rgba(0,0,0,0.12),0_4px_16px_rgba(0,0,0,0.06)]">
                <div className="flex items-center gap-2.5 bg-[#111110] px-5 py-3">
                  <div className="h-2.5 w-2.5 rounded-full bg-[#FF5F57]" />
                  <div className="h-2.5 w-2.5 rounded-full bg-[#FFBD2E]" />
                  <div className="h-2.5 w-2.5 rounded-full bg-[#28CA41]" />
                  <span className="ml-2 font-mono text-xs text-white/50">QMS — Dashboard</span>
                </div>
                
                <div className="flex flex-col gap-3.5 p-5">
                  <div className="grid grid-cols-3 gap-2.5">
                    <div className="rounded-[10px] border border-black/5 bg-[#F2F2F2] p-3.5 pb-3">
                      <div className="font-sans text-[20px] font-bold tracking-[-0.03em] text-[#FB4D27]">₹1.04L</div>
                      <div className="mt-0.5 text-[10px] font-medium text-[#929090]">Total Paid</div>
                    </div>
                    <div className="rounded-[10px] border border-black/5 bg-[#F2F2F2] p-3.5 pb-3">
                      <div className="font-sans text-[20px] font-bold tracking-[-0.03em] text-[#111110]">10</div>
                      <div className="mt-0.5 text-[10px] font-medium text-[#929090]">Approved</div>
                    </div>
                    <div className="rounded-[10px] border border-black/5 bg-[#F2F2F2] p-3.5 pb-3">
                      <div className="font-sans text-[20px] font-bold tracking-[-0.03em] text-[#111110]">2</div>
                      <div className="mt-0.5 text-[10px] font-medium text-[#929090]">Pending</div>
                    </div>
                  </div>

                  <div className="overflow-hidden rounded-[10px] border border-black/5 bg-[#F2F2F2] p-3.5">
                    <div className="mb-3 text-[11px] font-semibold uppercase tracking-[0.06em] text-[#929090]">Monthly Quotations</div>
                    <div className="flex h-[56px] items-end gap-1.5">
                      {[28, 45, 36, 58, 40, 65, 50, 72, 55, 48, 60, 45].map((h, i) => (
                        <div
                          key={i}
                          className={`flex-1 rounded-t transition-opacity duration-300 ${i === 8 ? "bg-[#FB4D27]" : "bg-[#D3D6DA]"}`}
                          style={{ height: `${h}%` }}
                        />
                      ))}
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    {[
                      { title: "Supply of Desktop Computers", dept: "CS Dept · ₹10,000", status: "Approved", pill: "bg-[#28CA41]/12 text-[#1a8c30]" },
                      { title: "Lab Equipment Request", dept: "ECE Dept · ₹4,500", status: "Pending", pill: "bg-[#FFBD2E]/15 text-[#9a6e00]" },
                      { title: "Office Supplies Quotation", dept: "Admin · ₹2,300", status: "Review", pill: "bg-[#FB4D27]/12 text-[#FB4D27]" },
                    ].map((item, i) => (
                      <div key={i} className="flex items-center justify-between rounded-lg border border-black/5 bg-[#F2F2F2] px-3 py-2.5">
                        <div className="flex flex-col gap-0.5">
                          <span className="text-[12px] font-semibold text-[#111110]">{item.title}</span>
                          <span className="text-[10px] text-[#929090]">{item.dept}</span>
                        </div>
                        <span className={`rounded-full px-2 py-[3px] text-[10px] font-semibold uppercase tracking-[0.04em] ${item.pill}`}>
                          {item.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section className="px-[clamp(20px,5vw,64px)] py-[clamp(64px,10vw,120px)]" id="features">
        <div className="mx-auto max-w-[1280px]">
          <div className="mb-4 inline-flex items-center gap-2 font-mono text-[11px] font-medium uppercase tracking-[0.12em] text-[#FB4D27] before:block before:h-px before:w-6 before:bg-[#FB4D27] before:content-['']">
            Platform Features
          </div>
          <h2 className="mb-14 max-w-[600px] font-sans text-[clamp(32px,4vw,52px)] font-bold leading-[1.08] tracking-[-0.03em] text-[#111110]">
            Everything you need
            <br />
            <em className="font-light not-italic text-[#929090]">in one place</em>
          </h2>
          <div className="grid overflow-hidden rounded-[14px] border border-black/5 bg-black/5 gap-0.5 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((f, i) => (
              <FeatureCard key={i} {...f} index={i} />
            ))}
          </div>
        </div>
      </section>

      {/* ── Workflow ── */}
      <section className="relative overflow-hidden bg-[#111110] px-[clamp(20px,5vw,64px)] py-[clamp(64px,10vw,120px)]" id="workflow">
        <div className="mx-auto max-w-[1280px]">
          <div className="mb-4 inline-flex items-center gap-2 font-mono text-[11px] font-medium uppercase tracking-[0.12em] text-[#FB4D27] before:block before:h-px before:w-6 before:bg-[#FB4D27] before:content-['']">
            How It Works
          </div>
          <h2 className="mb-14 max-w-[600px] font-sans text-[clamp(32px,4vw,52px)] font-bold leading-[1.08] tracking-[-0.03em] text-white">
            Six steps from
            <br />
            <em className="font-light not-italic text-white/35">request to payment</em>
          </h2>
          <div className="grid overflow-hidden rounded-[14px] border border-white/5 bg-white/5 gap-px sm:grid-cols-2 lg:grid-cols-3">
            {steps.map((s, i) => (
              <div key={i} data-num={s.num} className="relative overflow-hidden bg-[#2a2826] p-7 transition-colors duration-250 hover:bg-[#322e2b] md:p-8 before:absolute before:-bottom-2.5 before:right-3 before:pointer-events-none before:font-sans before:text-[80px] before:font-bold before:leading-none before:tracking-[-0.05em] before:text-white/5 before:content-[attr(data-num)]">
                <div className="mb-3.5 font-mono text-[11px] font-medium tracking-[0.1em] text-[#FB4D27]">{s.num}</div>
                <h3 className="mb-2 text-base font-semibold tracking-[-0.01em] text-white">{s.title}</h3>
                <p className="text-[13px] leading-[1.6] text-white/45">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Roles ── */}
      <section className="px-[clamp(20px,5vw,64px)] py-[clamp(64px,10vw,120px)]" id="roles">
        <div className="mx-auto max-w-[1280px]">
          <div className="mb-4 inline-flex items-center gap-2 font-mono text-[11px] font-medium uppercase tracking-[0.12em] text-[#FB4D27] before:block before:h-px before:w-6 before:bg-[#FB4D27] before:content-['']">
            Role-Based Access
          </div>
          <h2 className="mb-14 max-w-[600px] font-sans text-[clamp(32px,4vw,52px)] font-bold leading-[1.08] tracking-[-0.03em] text-[#111110]">
            Built for every
            <br />
            <em className="font-light not-italic text-[#929090]">stakeholder</em>
          </h2>
          <div className="grid gap-4 lg:grid-cols-2">
            {[
              {
                name: "HOD",
                color: "#FB4D27",
                bgColor: "rgba(251,77,39,0.08)",
                actions: ["Create & submit quotation requests", "Review vendor responses", "Select preferred vendor (L1/L2)", "Verify product delivery via OTP"],
              },
              {
                name: "Accountant",
                color: "#929090",
                bgColor: "rgba(146,144,144,0.1)",
                actions: ["Verify and forward quotation requests", "Review vendor quotations", "Process payments via Razorpay", "Generate expense reports & exports"],
              },
              {
                name: "Principal",
                color: "#4C433F",
                bgColor: "rgba(76,67,63,0.08)",
                actions: ["Approve or reject quotations", "View procurement reports", "Monitor transactions and audit logs", "Oversee institutional spending"],
              },
              {
                name: "Vendor",
                color: "#5B7FA6",
                bgColor: "rgba(91,127,166,0.08)",
                actions: ["View and respond to quotation requests", "Submit competitive pricing", "Confirm order acknowledgement", "Generate OTP for delivery verification"],
              },
            ].map((role, i) => (
              <div key={i} className="group rounded-[14px] border border-black/5 bg-white p-8 transition-all duration-250 hover:-translate-y-[3px] hover:border-[#FB4D27] hover:shadow-[0_8px_32px_rgba(251,77,39,0.1)]">
                <div className="mb-5 flex items-center justify-between">
                  <span className="text-lg font-bold tracking-[-0.02em] text-[#111110]">{role.name}</span>
                  <div className="flex h-10 w-10 items-center justify-center rounded-[10px]" style={{ background: role.bgColor }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={role.color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                      <circle cx="12" cy="7" r="4" />
                    </svg>
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  {role.actions.map((a, j) => (
                    <div key={j} className="flex items-center gap-2.5 text-[13px] text-[#4C433F]">
                      <span className="h-[5px] w-[5px] shrink-0 rounded-full" style={{ backgroundColor: role.color }} />
                      {a}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <div className="relative mx-[clamp(20px,5vw,64px)] mb-[clamp(48px,8vw,96px)] flex flex-wrap items-center justify-center gap-12 overflow-hidden rounded-[20px] bg-[#111110] px-[clamp(32px,5vw,72px)] py-[clamp(48px,8vw,88px)] text-center sm:justify-between sm:text-left">
        <div className="pointer-events-none absolute -right-[80px] -top-[80px] h-[400px] w-[400px] rounded-full bg-[radial-gradient(circle,rgba(251,77,39,0.2)_0%,transparent_70%)]" />
        <div className="relative z-10 max-w-[560px]">
          <h2 className="mb-4 font-sans text-[clamp(28px,4vw,48px)] font-bold leading-[1.1] tracking-[-0.03em] text-white">
            Ready to modernise
            <br />
            <span className="text-[#FB4D27]">your procurement?</span>
          </h2>
          <p className="text-base leading-[1.6] text-white/50">
            Join institutions already using QMS to eliminate manual paperwork
            and bring transparency to every stage of procurement.
          </p>
        </div>
        <div className="relative z-10 flex w-full justify-center sm:w-auto">
          <Link href="/registration" className="group inline-flex whitespace-nowrap items-center gap-2.5 rounded-lg bg-white px-8 py-4 font-sans text-base font-semibold text-[#111110] transition-all duration-250 hover:-translate-y-0.5 hover:bg-[#FB4D27] hover:text-white">
            Create your account
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="transition-transform duration-250 group-hover:translate-x-1">
              <line x1="5" y1="12" x2="19" y2="12" />
              <polyline points="12 5 19 12 12 19" />
            </svg>
          </Link>
        </div>
      </div>

      {/* ── Footer ── */}
      <footer className="border-t border-white/5 bg-[#111110] px-[clamp(20px,5vw,64px)] py-[clamp(32px,5vw,48px)]">
        <div className="mx-auto flex max-w-[1280px] flex-wrap items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-2.5 no-underline">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] bg-[#111110]">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21.21 15.89A10 10 0 1 1 8 2.83" />
                <path d="M22 12A10 10 0 0 0 12 2v10z" />
              </svg>
            </div>
            <span className="text-[15px] font-bold tracking-[-0.01em] text-white">
              Q<span className="text-[#FB4D27]">M</span>S
            </span>
          </Link>
          <ul className="flex list-none gap-6">
            <li><a href="#features" className="text-[13px] text-white/40 transition-colors duration-200 hover:text-white">Features</a></li>
            <li><a href="#workflow" className="text-[13px] text-white/40 transition-colors duration-200 hover:text-white">Workflow</a></li>
            <li><Link href="/login" className="text-[13px] text-white/40 transition-colors duration-200 hover:text-white">Sign in</Link></li>
            <li><Link href="/registration" className="text-[13px] text-white/40 transition-colors duration-200 hover:text-white">Register</Link></li>
          </ul>
          <p className="text-[13px] text-white/30">© 2026 QMS · GEC Idukki, Kerala</p>
        </div>
      </footer>
    </div>
  );
}