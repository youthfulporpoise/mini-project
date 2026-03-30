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

// for requests which do not require CSRF TOKEN
const publicInstance = axios.create({
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

export async function fetchProfileDetails() {
  try {
    const response = await instance.get(`/profile/`);
    return response.data;
  } catch (error) {
    console.error("Error fetching quotation data:", error);
    return null;
  }
}
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

export async function registrationRequest(userDetails) {
  try {
    const response = await instance.post(`/register/`, userDetails);

    return { success: true, data: response.data };
  } catch (error) {
    console.error("Registration Error:", error);
    return { success: false, error };
  }
}
export async function performLogin(userDetails: {
  username: string;
  password: string;
}) {
  try {
    const response = await publicInstance.post(`/login/`, userDetails);
    return { success: true, data: response.data };
  } catch (error) {
    console.error("Login API Error:", error);
    return { success: false, error };
  }
}
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

export async function createOrder(payload: {quotation_id: string , amount : number} ) {
  try {
    const response = await instance.post(`/payment/create-order/`,payload);
    return response.data;
  } catch (error) {
    console.error("Error creating order for payment: ", error);
    return null;
  }
}

export async function verifyPayment(payload: {razorpay_order_id : string , razorpay_payment_id: string, razorpay_signature: string} ) {
  try {
    const response = await instance.post(`/payment/verify/`,payload);
    return response.data;
  } catch (error) {
    console.error("Error creating order for payment: ", error);
    return null;
  }
}




// PATCH REQUEST
export async function updateQuotationById(quotation_id: string, payload) {
  try {
    const response = await instance.patch(`/qt/${quotation_id}`, payload);
    return response.data;
  } catch (error) {
    console.error("Error updating quotation data:", error);
    return null;
  }
}
