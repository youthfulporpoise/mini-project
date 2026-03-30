"use client";
import { useState, ChangeEvent, FormEvent } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import {
  fetchProfileDetails,
  performLogin,
  registrationRequest,
} from "../utility/api";

type Role = "HOD" | "PRINCIPAL" | "ACCOUNTANT" | "VENDOR" | "ADMIN";
type Mode = "login" | "signup";

interface LoginData {
  username: string;
  password: string;
}

interface SignupData {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
  phone: string;
  role: Role;
}

export default function AuthPage() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("login");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [transitioning, setTransitioning] = useState(false);

  const [loginData, setLoginData] = useState<LoginData>({
    username: "",
    password: "",
  });
  const [signupData, setSignupData] = useState<SignupData>({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "+91 ",
    role: "HOD",
  });

  const switchMode = (next: Mode) => {
    if (next === mode) return;
    setTransitioning(true);
    setError("");
    setTimeout(() => {
      setMode(next);
      setTransitioning(false);
    }, 350);
  };

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const userDetails = {
        username: loginData.username,
        password: loginData.password,
      };
      const res = await performLogin(userDetails);
      const profileRes = await fetchProfileDetails();
      Cookies.set("userProfile", JSON.stringify(profileRes), {
        expires: 1,
      });
      const role = res.data.role;
      if (role === "HOD") router.push("/hod");
      else if (role === "PRINCIPAL") router.push("/principal");
      else if (role === "ACCOUNTANT") router.push("/accountant");
      else if (role === "VENDOR") router.push("/vendor");
      else router.push("/overview");
    } catch {
      setError("Invalid username or password");
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e: FormEvent) => {
    e.preventDefault();
    if (signupData.password !== signupData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const userRegistrationDetails = {
        username: signupData.username,
        email: signupData.email,
        password: signupData.password,
        phone: signupData.phone,
        role: signupData.role,
      };
      await registrationRequest(userRegistrationDetails);

      const role = signupData.role;
      if (role === "HOD") router.push("/hod");
      else if (role === "PRINCIPAL") router.push("/principal");
      else if (role === "ACCOUNTANT") router.push("/accountant");
      else if (role === "VENDOR") router.push("/vendor");
      else router.push("/overview");
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const usernameError = err.response?.data?.username;
        setError(usernameError || "Registration failed. Try again.");
      } else {
        setError("Registration failed. Try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    "w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 text-sm focus:outline-none focus:border-[#FF5A00] focus:bg-white/10 transition-all duration-300";
  const labelClass =
    "block text-xs font-semibold tracking-widest text-white/50 uppercase mb-2";

  return (
    <div
      className="min-h-screen flex items-center justify-center relative overflow-hidden"
      style={{
        background:
          "linear-gradient(135deg, #0a0a0a 0%, #1a0a00 50%, #0a0a0a 100%)",
      }}
    >
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full opacity-20"
          style={{
            background: "radial-gradient(circle, #FF5A00 0%, transparent 70%)",
          }}
        />
        <div
          className="absolute -bottom-40 -right-40 w-[500px] h-[500px] rounded-full opacity-15"
          style={{
            background: "radial-gradient(circle, #C1121F 0%, transparent 70%)",
          }}
        />
        <div
          className="absolute top-0 right-1/3 w-px h-full opacity-10"
          style={{
            background:
              "linear-gradient(to bottom, transparent, #FF5A00, transparent)",
          }}
        />
        <div
          className="absolute bottom-0 left-0 right-0 text-center select-none overflow-hidden"
          style={{
            fontSize: "clamp(80px, 18vw, 220px)",
            fontWeight: 900,
            color: "rgba(255,90,0,0.04)",
            letterSpacing: "-0.05em",
            lineHeight: 1,
          }}
        >
          QMS
        </div>
      </div>

      {/* Main card */}
      <div
        className="relative w-full max-w-5xl mx-4 flex min-h-[600px] overflow-hidden rounded-3xl"
        style={{
          boxShadow:
            "0 40px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.05)",
        }}
      >
        {/* LEFT PANEL */}
        <div
          className="hidden lg:flex flex-col justify-between w-[42%] flex-shrink-0 relative overflow-hidden p-12"
          style={{
            background:
              "linear-gradient(145deg, #FF5A00 0%, #C1121F 60%, #7b0a12 100%)",
          }}
        >
          {/* Noise texture overlay */}
          <div
            className="absolute inset-0 opacity-20"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
              backgroundSize: "150px",
            }}
          />
          <div className="absolute -bottom-20 -right-20 w-64 h-64 rounded-full border border-white/10" />
          <div className="absolute -bottom-10 -right-10 w-44 h-44 rounded-full border border-white/10" />

          {/* Logo */}
          <div className="relative">
            <div className="inline-flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 backdrop-blur rounded-xl flex items-center justify-center">
                <svg
                  className="w-5 h-5 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  />
                </svg>
              </div>
              <span className="text-white font-black text-xl tracking-tight">
                QMS
              </span>
            </div>
          </div>

          {/* Headline */}
          <div className="relative">
            <p className="text-white/50 text-xs tracking-[0.3em] uppercase font-semibold mb-4">
              Quotation Management
            </p>
            <h1
              className="text-white font-black leading-none mb-6"
              style={{
                fontSize: "clamp(42px, 5vw, 64px)",
                letterSpacing: "-0.04em",
              }}
            >
              MANAGE.
              <br />
              TRACK.
              <br />
              DELIVER.
            </h1>
            <p className="text-white/60 text-sm leading-relaxed max-w-xs">
              From initial quote to final invoice — streamline every step of
              your financial workflow with precision.
            </p>
          </div>

          {/* Stats */}
          <div className="relative flex gap-8">
            <div>
              <div
                className="text-white font-black text-2xl"
                style={{ letterSpacing: "-0.05em" }}
              >
                472+
              </div>
              <div className="text-white/50 text-xs tracking-wider uppercase mt-1">
                Expert Solutions
              </div>
            </div>
            <div className="w-px bg-white/20" />
            <div>
              <div
                className="text-white font-black text-2xl"
                style={{ letterSpacing: "-0.05em" }}
              >
                597+
              </div>
              <div className="text-white/50 text-xs tracking-wider uppercase mt-1">
                Enterprises
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT PANEL */}
        <div
          className="flex-1 relative flex flex-col"
          style={{
            background: "rgba(10,10,10,0.95)",
            backdropFilter: "blur(20px)",
          }}
        >
          {/* Tab switcher */}
          <div className="flex border-b border-white/5">
            {(["login", "signup"] as Mode[]).map((tab) => (
              <button
                key={tab}
                onClick={() => switchMode(tab)}
                className={`flex-1 py-5 text-xs font-bold tracking-[0.2em] uppercase transition-all duration-300 relative ${
                  mode === tab
                    ? "text-white"
                    : "text-white/30 hover:text-white/60"
                }`}
              >
                {tab === "login" ? "Sign In" : "Register"}
                {mode === tab && (
                  <div
                    className="absolute bottom-0 left-0 right-0 h-0.5"
                    style={{
                      background: "linear-gradient(90deg, #FF5A00, #C1121F)",
                    }}
                  />
                )}
              </button>
            ))}
          </div>

          {/* Form area */}
          <div className="flex-1 overflow-y-auto px-8 py-8">
            <div
              style={{
                opacity: transitioning ? 0 : 1,
                transform: transitioning ? "translateY(12px)" : "translateY(0)",
                transition: "opacity 350ms ease, transform 350ms ease",
              }}
            >
              {/* Error banner */}
              {error && (
                <div
                  className="mb-6 px-4 py-3 rounded-xl text-sm flex items-center gap-3"
                  style={{
                    background: "rgba(193,18,31,0.15)",
                    border: "1px solid rgba(193,18,31,0.3)",
                    color: "#ff6b78",
                  }}
                >
                  <svg
                    className="w-4 h-4 flex-shrink-0"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                  {error}
                </div>
              )}

              {/* LOGIN FORM */}
              {mode === "login" && (
                <form onSubmit={handleLogin} className="space-y-5">
                  <div className="mb-8">
                    <h2
                      className="text-white font-black text-3xl"
                      style={{ letterSpacing: "-0.04em" }}
                    >
                      Welcome back
                    </h2>
                    <p className="text-white/40 text-sm mt-1">
                      Sign in to your account to continue
                    </p>
                  </div>

                  <div>
                    <label className={labelClass}>Username / Employee ID</label>
                    <div className="relative">
                      <svg
                        className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                        />
                      </svg>
                      <input
                        type="text"
                        value={loginData.username}
                        onChange={(e) =>
                          setLoginData({
                            ...loginData,
                            username: e.target.value,
                          })
                        }
                        required
                        placeholder="Enter your username"
                        className={`${inputClass} pl-11`}
                      />
                    </div>
                  </div>

                  <div>
                    <label className={labelClass}>Password</label>
                    <div className="relative">
                      <svg
                        className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                        />
                      </svg>
                      <input
                        type={showPassword ? "text" : "password"}
                        value={loginData.password}
                        onChange={(e) =>
                          setLoginData({
                            ...loginData,
                            password: e.target.value,
                          })
                        }
                        required
                        placeholder="••••••••"
                        className={`${inputClass} pl-11 pr-11`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
                      >
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          {showPassword ? (
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                            />
                          ) : (
                            <>
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                              />
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                              />
                            </>
                          )}
                        </svg>
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        className="w-3.5 h-3.5 rounded border-white/20 bg-transparent accent-orange-500"
                      />
                      <span className="text-white/40 text-xs">Remember me</span>
                    </label>
                    <button
                      type="button"
                      className="text-xs font-semibold transition-colors"
                      style={{ color: "#FF5A00" }}
                      onMouseEnter={(e) =>
                        ((e.currentTarget as HTMLButtonElement).style.color =
                          "#ff7a30")
                      }
                      onMouseLeave={(e) =>
                        ((e.currentTarget as HTMLButtonElement).style.color =
                          "#FF5A00")
                      }
                    >
                      Forgot password?
                    </button>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-4 rounded-xl font-black text-sm tracking-[0.15em] uppercase text-white transition-all duration-300 mt-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{
                      background:
                        "linear-gradient(135deg, #FF5A00 0%, #C1121F 100%)",
                      boxShadow: "0 8px 24px rgba(255,90,0,0.3)",
                    }}
                    onMouseEnter={(e) => {
                      if (!loading)
                        (e.currentTarget as HTMLButtonElement).style.boxShadow =
                          "0 12px 32px rgba(255,90,0,0.5)";
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLButtonElement).style.boxShadow =
                        "0 8px 24px rgba(255,90,0,0.3)";
                    }}
                  >
                    {loading ? "Signing in..." : "Sign In →"}
                  </button>

                  <p className="text-center text-white/30 text-xs pt-2">
                    Don&apos;t have an account?{" "}
                    <button
                      type="button"
                      onClick={() => switchMode("signup")}
                      className="font-bold transition-colors"
                      style={{ color: "#FF5A00" }}
                      onMouseEnter={(e) =>
                        ((e.currentTarget as HTMLButtonElement).style.color =
                          "#ff7a30")
                      }
                      onMouseLeave={(e) =>
                        ((e.currentTarget as HTMLButtonElement).style.color =
                          "#FF5A00")
                      }
                    >
                      Register
                    </button>
                  </p>
                </form>
              )}

              {/* SIGNUP FORM */}
              {mode === "signup" && (
                <form onSubmit={handleSignup} className="space-y-4">
                  <div className="mb-6">
                    <h2
                      className="text-white font-black text-3xl"
                      style={{ letterSpacing: "-0.04em" }}
                    >
                      Create account
                    </h2>
                    <p className="text-white/40 text-sm mt-1">
                      Enter your official credentials to register
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={labelClass}>
                        Username <span className="text-[#FF5A00]">*</span>
                      </label>
                      <input
                        type="text"
                        value={signupData.username}
                        onChange={(e: ChangeEvent<HTMLInputElement>) =>
                          setSignupData({
                            ...signupData,
                            username: e.target.value,
                          })
                        }
                        required
                        placeholder="john_doe"
                        className={inputClass}
                      />
                    </div>
                    <div>
                      <label className={labelClass}>
                        Phone <span className="text-[#FF5A00]">*</span>
                      </label>
                      <input
                        type="tel"
                        value={signupData.phone}
                        onChange={(e: ChangeEvent<HTMLInputElement>) =>
                          setSignupData({
                            ...signupData,
                            phone: e.target.value,
                          })
                        }
                        required
                        placeholder="+91 XXXXX XXXXX"
                        className={inputClass}
                      />
                    </div>
                  </div>

                  <div>
                    <label className={labelClass}>
                      Email address <span className="text-[#FF5A00]">*</span>
                    </label>
                    <input
                      type="email"
                      value={signupData.email}
                      onChange={(e: ChangeEvent<HTMLInputElement>) =>
                        setSignupData({ ...signupData, email: e.target.value })
                      }
                      required
                      placeholder="name@organization.com"
                      className={inputClass}
                    />
                  </div>

                  <div>
                    <label className={labelClass}>
                      Role <span className="text-[#FF5A00]">*</span>
                    </label>
                    <select
                      value={signupData.role}
                      onChange={(e: ChangeEvent<HTMLSelectElement>) =>
                        setSignupData({
                          ...signupData,
                          role: e.target.value as Role,
                        })
                      }
                      required
                      className={`${inputClass} appearance-none cursor-pointer`}
                      style={{
                        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='rgba(255,255,255,0.3)' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`,
                        backgroundRepeat: "no-repeat",
                        backgroundPosition: "right 16px center",
                      }}
                    >
                      <option value="HOD" style={{ background: "#1a0a00" }}>
                        Head of Department
                      </option>
                      <option
                        value="PRINCIPAL"
                        style={{ background: "#1a0a00" }}
                      >
                        Principal
                      </option>
                      <option
                        value="ACCOUNTANT"
                        style={{ background: "#1a0a00" }}
                      >
                        Accountant
                      </option>
                      <option value="VENDOR" style={{ background: "#1a0a00" }}>
                        Vendor
                      </option>
                      <option value="ADMIN" style={{ background: "#1a0a00" }}>
                        Admin
                      </option>
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={labelClass}>
                        Password <span className="text-[#FF5A00]">*</span>
                      </label>
                      <div className="relative">
                        <input
                          type={showPassword ? "text" : "password"}
                          value={signupData.password}
                          onChange={(e: ChangeEvent<HTMLInputElement>) =>
                            setSignupData({
                              ...signupData,
                              password: e.target.value,
                            })
                          }
                          required
                          placeholder="••••••••"
                          className={`${inputClass} pr-11`}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
                        >
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            {showPassword ? (
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                              />
                            ) : (
                              <>
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                                />
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                                />
                              </>
                            )}
                          </svg>
                        </button>
                      </div>
                    </div>
                    <div>
                      <label className={labelClass}>
                        Confirm <span className="text-[#FF5A00]">*</span>
                      </label>
                      <div className="relative">
                        <input
                          type={showConfirm ? "text" : "password"}
                          value={signupData.confirmPassword}
                          onChange={(e: ChangeEvent<HTMLInputElement>) =>
                            setSignupData({
                              ...signupData,
                              confirmPassword: e.target.value,
                            })
                          }
                          required
                          placeholder="••••••••"
                          className={`${inputClass} pr-11`}
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirm(!showConfirm)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
                        >
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            {showConfirm ? (
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                              />
                            ) : (
                              <>
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                                />
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                                />
                              </>
                            )}
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-4 rounded-xl font-black text-sm tracking-[0.15em] uppercase text-white transition-all duration-300 mt-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{
                      background:
                        "linear-gradient(135deg, #FF5A00 0%, #C1121F 100%)",
                      boxShadow: "0 8px 24px rgba(255,90,0,0.3)",
                    }}
                    onMouseEnter={(e) => {
                      if (!loading)
                        (e.currentTarget as HTMLButtonElement).style.boxShadow =
                          "0 12px 32px rgba(255,90,0,0.5)";
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLButtonElement).style.boxShadow =
                        "0 8px 24px rgba(255,90,0,0.3)";
                    }}
                  >
                    {loading ? "Creating account..." : "Create Account →"}
                  </button>

                  <p className="text-center text-white/30 text-xs pt-1">
                    Already have an account?{" "}
                    <button
                      type="button"
                      onClick={() => switchMode("login")}
                      className="font-bold transition-colors"
                      style={{ color: "#FF5A00" }}
                      onMouseEnter={(e) =>
                        ((e.currentTarget as HTMLButtonElement).style.color =
                          "#ff7a30")
                      }
                      onMouseLeave={(e) =>
                        ((e.currentTarget as HTMLButtonElement).style.color =
                          "#FF5A00")
                      }
                    >
                      Sign in
                    </button>
                  </p>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
