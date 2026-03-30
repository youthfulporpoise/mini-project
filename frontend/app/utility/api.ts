// src/services/quotations.ts
import axios from "axios";
import Cookies from "js-cookie";
import { BACKEND_URL } from "../utility";

// Axios instance for custom config
const instance = axios.create({
  baseURL: BACKEND_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// This function run dynamically every time a request is hit.
instance.interceptors.request.use(
  (config) => {
    const csrfToken = Cookies.get("csrftoken");
    if (csrfToken) {
      config.headers["X-CSRFToken"] = csrfToken;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

const responsesUrl = `/responses/`;
const quotationsUrl = `/qt/`;

// --- GET REQUESTS ---

export async function fetchQuotations() {
  try {
    const response = await instance.get(quotationsUrl);
    return response.data;
  } catch (error) {
    console.error("Error fetching quotation data:", error);
    return null;
  }
}

export async function fetchQuotationById(quotation_id: string) {
  try {
    const response = await instance.get(`/qt/${quotation_id}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching quotation data:", error);
    return null;
  }
}

export async function fetchResponses() {
  try {
    const response = await instance.get(responsesUrl);
    return response.data;
  } catch (error) {
    console.error("Error fetching responses data:", error);
    return null;
  }
}

export async function acceptedQuotations() {
  try {
    const response = await instance.get(`/quotations/accepted/`);
    return response.data;
  } catch (error) {
    console.error("Error fetching accepted quotations data:", error);
    return null;
  }
}

export async function getAllTransactionDetails() {
  try {
    const response = await instance.get(`/razorpay/transactions`);
    return response.data;
  } catch (error) {
    console.error("Error fetching Transactions:", error);
    return null;
  }
}

// --- POST REQUESTS ---

export async function performLogout() {
  try {
    const response = await instance.post(`/logout/`, {});

    Cookies.remove("userProfile");
    Cookies.remove("csrftoken");

    return { success: true, data: response.data };
  } catch (error) {
    console.error("Logout API Error:", error);
    return { success: false, error };
  }
}

export async function createQuotation(backendData: any) {
  try {
    const response = await instance.post(quotationsUrl, backendData);
    return response.data;
  } catch (error) {
    console.error("Error creating quotation data:", error);
    return null;
  }
}

export async function createResponses(backendData: any) {
  try {
    const response = await instance.post(responsesUrl, backendData);
    return response.data;
  } catch (error) {
    console.error("Error creating a new response: ", error);
    return null;
  }
}

export async function performQuotationApproval(
  quotationId: string,
  responseId: string,
) {
  try {
    const response = await instance.post(`/quotations/accepted/`, {
      quotation: quotationId,
      response: responseId,
    });
    return response.data;
  } catch (error) {
    console.error("Error Accepting the quotation: ", error);
    return null;
  }
}

export async function generateOTP(quotationId: string) {
  try {
    const response = await instance.post(`/delivery/generate-otp/`, {
      quotation_id: quotationId,
    });
    return response.data;
  } catch (error) {
    console.error("Error generating the otp : ", error);
    return null;
  }
}

export async function verifyOTP(quotationId: string, otp: string) {
  try {
    const response = await instance.post(`/delivery/verify-otp/`, {
      quotation_id: quotationId,
      otp: otp,
    });
    return response.data;
  } catch (error) {
    console.error("Error verifying the otp : ", error);
    return null;
  }
}
