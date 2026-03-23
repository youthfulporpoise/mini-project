"use client";

import React, { useState, ChangeEvent, FormEvent } from "react";
import Image from "next/image";
import quotationImage from "../components/icons/quotation-final.png";
import { BACKEND_URL } from "../utility";
import axios from "axios";

interface FormData {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
  phone: string;
  role: "Head of Department" | "Principal" | "Accountant" | "Vendor" | "Admin";
}

export default function Page() {
  const [formData, setFormData] = useState<FormData>({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "+91 ",
    role: "Head of Department",
  });
  const [error, setError] = useState<string>("");

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError("");
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    try {
      const url = `${BACKEND_URL}/register/`;
      const options = {
        headers: {
          "Content-Type": "application/json",
        },
        withCredentials: true,
      };

      await axios.post(
        url,
        {
          username: formData.username,
          email: formData.email,
          password: formData.password,
          phone: formData.phone,
          role: formData.role,
        },
        options,
      );
      console.log("successful registration ");
    } catch (error) {
      console.log("Registration Failed" + error);
    }
  };

  return (
    // Outer page — light gray background like in the image
    <div
      className="min-h-screen flex items-center justify-center p-6"
      style={{
        background: "linear-gradient(135deg, #e8e8f0 0%, #d8d8e8 100%)",
      }}
    >
      {/* Card wrapper — the floating rounded card in the image */}
      <div
        className="flex w-full overflow-hidden"
        style={{
          maxWidth: "900px",
          borderRadius: "24px",
          boxShadow: "0 24px 64px rgba(80, 60, 180, 0.18)",
          minHeight: "580px",
        }}
      >
        {/* ── Left Panel — purple gradient ── */}
        <div
          className="hidden lg:flex flex-col items-center justify-center px-10 py-12 text-center"
          style={{
            width: "42%",
            flexShrink: 0,
            background:
              "linear-gradient(160deg, #6c4ecb 0%, #3b2a8a 60%, #2d1f6e 100%)",
            borderRadius: "24px 0 0 24px",
          }}
        >
          <h1
            className="font-bold text-white mb-3"
            style={{ fontSize: "42px", letterSpacing: "-0.5px" }}
          >
            QMS
          </h1>
          <p
            className="text-white mb-8 leading-relaxed"
            style={{ opacity: 0.85, fontSize: "15px", maxWidth: "220px" }}
          >
            Streamline your workflow from initial quote to final invoice.
          </p>
          <div className="w-full flex items-center justify-center">
            <Image
              src={quotationImage}
              alt="Quotation Management Illustration"
              className="object-contain"
              style={{ maxWidth: "260px", width: "100%" }}
            />
          </div>
        </div>

        {/* ── Right Panel — white form ── */}
        <div
          className="flex-1 flex flex-col justify-center px-10 py-10 bg-white"
          style={{ borderRadius: "0 24px 24px 0" }}
        >
          {/* Header */}
          <div className="mb-5">
            <h2
              className="font-bold text-gray-900"
              style={{ fontSize: "26px", letterSpacing: "-0.3px" }}
            >
              User Registration
            </h2>
            <p className="text-gray-500 mt-1" style={{ fontSize: "14px" }}>
              Please enter your official credentials
            </p>
          </div>

          {/* Error banner */}
          {error && (
            <div className="mb-4 px-4 py-3 bg-red-50 border-l-4 border-red-500 text-red-700 text-sm rounded-r-lg">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Username */}
            <div>
              <label
                htmlFor="username"
                className="block font-medium text-gray-800 mb-1"
                style={{ fontSize: "13px" }}
              >
                Username <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="username"
                name="username"
                value={formData.username}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-gray-50
                  focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-400
                  focus:border-transparent transition-all"
                style={{ fontSize: "14px" }}
              />
              <p className="mt-1 text-gray-400" style={{ fontSize: "11px" }}>
                Required. 150 characters or fewer. Letters, digits and @/./+/-/_
                only.
              </p>
            </div>

            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className="block font-medium text-gray-800 mb-1"
                style={{ fontSize: "13px" }}
              >
                Email address <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-gray-50
                  focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-400
                  focus:border-transparent transition-all"
                style={{ fontSize: "14px" }}
              />
            </div>

            {/* Phone */}
            <div>
              <label
                htmlFor="phone"
                className="block font-medium text-gray-800 mb-1"
                style={{ fontSize: "13px" }}
              >
                Phone <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-gray-50
                  focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-400
                  focus:border-transparent transition-all"
                style={{ fontSize: "14px" }}
              />
            </div>

            {/* Role */}
            <div>
              <label
                htmlFor="role"
                className="block font-medium text-gray-800 mb-1"
                style={{ fontSize: "13px" }}
              >
                Role <span className="text-red-500">*</span>
              </label>
              <select
                id="role"
                name="role"
                value={formData.role}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-gray-50
                  focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-400
                  focus:border-transparent transition-all text-gray-700"
                style={{ fontSize: "14px" }}
              >
                <option value="" disabled>
                  Select a role
                </option>
                <option value="Head of Department">Head of Department</option>
                <option value="Principal">Principal</option>
                <option value="Accountant">Accountant</option>
                <option value="Vendor">Vendor</option>
                <option value="Admin">Admin</option>
              </select>
            </div>

            {/* Password row */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="password"
                  className="block font-medium text-gray-800 mb-1"
                  style={{ fontSize: "13px" }}
                >
                  Password <span className="text-red-500">*</span>
                </label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  placeholder="••••••••"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-gray-50
                    focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-400
                    focus:border-transparent transition-all"
                  style={{ fontSize: "14px" }}
                />
              </div>

              <div>
                <label
                  htmlFor="confirmPassword"
                  className="block font-medium text-gray-800 mb-1"
                  style={{ fontSize: "13px" }}
                >
                  Confirm Password <span className="text-red-500">*</span>
                </label>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  placeholder="••••••••"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-gray-50
                    focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-400
                    focus:border-transparent transition-all"
                  style={{ fontSize: "14px" }}
                />
              </div>
            </div>

            {/* Register button — indigo/purple matching the image */}
            <button
              type="submit"
              className="w-full text-white font-semibold py-3 rounded-xl
                transition-all focus:outline-none focus:ring-2 focus:ring-indigo-400
                focus:ring-offset-2 mt-1"
              style={{
                background: "linear-gradient(90deg, #5c4ec9 0%, #4338b8 100%)",
                fontSize: "15px",
                letterSpacing: "0.01em",
              }}
              onMouseEnter={(e) => {
                (e.target as HTMLButtonElement).style.background =
                  "linear-gradient(90deg, #4a3db5 0%, #3228a0 100%)";
              }}
              onMouseLeave={(e) => {
                (e.target as HTMLButtonElement).style.background =
                  "linear-gradient(90deg, #5c4ec9 0%, #4338b8 100%)";
              }}
            >
              Register
            </button>
          </form>

          {/* Login link */}
          <p
            className="text-center text-gray-500 mt-5"
            style={{ fontSize: "13px" }}
          >
            Already have an account?{" "}
            <a
              href="/login"
              className="font-semibold"
              style={{ color: "#4338b8" }}
            >
              Log in
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
