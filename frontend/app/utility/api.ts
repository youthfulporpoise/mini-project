// src/services/quotations.ts
import axios from "axios";
import Cookies from "js-cookie";
import { BACKEND_URL } from "../utility";

const csrfToken = Cookies.get("csrftoken");
const options = {
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
    "X-CSRFToken": csrfToken,
  },
};

const responsesUrl = `${BACKEND_URL}/responses/`;
const quotationsUrl = `${BACKEND_URL}/qt/`;
// GET REQUESTS
export async function fetchQuotations() {
  try {
    const response = await axios.get(quotationsUrl, options);
    return response.data;
  } catch (error) {
    console.error("Error fetching quotation data:", error);
    return null;
  }
}

export async function fetchQuotationById(quotation_id: string) {
  try {
    const url = `${BACKEND_URL}/qt/${quotation_id}`;
    const response = await axios.get(url, options);
    return response.data;
  } catch (error) {
    console.error("Error fetching quotation data:", error);
    return null;
  }
}
export async function fetchResponses() {
  try {
    const response = await axios.get(responsesUrl, options);
    console.log(response);
    return response.data;
  } catch (error) {
    console.error("Error fetching responses data:", error);
    return null;
  }
}
export async function acceptedQuotations() {
  try {
    const qtAcceptUrl = `${BACKEND_URL}/quotations/accepted/`;
    const response = await axios.get(qtAcceptUrl, options);
    console.log(response);
    return response.data;
  } catch (error) {
    console.error("Error fetching responses data:", error);
    return null;
  }
}

// POST REQUESTS

export async function performLogout() {
  try {
    const url = `${BACKEND_URL}/logout/`;

    const response = await axios.post(url, {}, options);

    Cookies.remove("userProfile");
    Cookies.remove("csrftoken");

    return { success: true, data: response.data };
  } catch (error) {
    console.error("Logout API Error:", error);
    return { success: false, error };
  }
}

export async function createQuotation(backendData) {
  try {
    const response = await axios.post(quotationsUrl, backendData, options);
    return response.data;
  } catch (error) {
    console.error("Error creating quotation data:", error);
    return null;
  }
}

export async function createResponses(backendData) {
  try {
    console.log(backendData);
    const response = await axios.post(responsesUrl, backendData, options);
    console.log(response);
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
    const qtAcceptUrl = `${BACKEND_URL}/quotations/accepted/`;
    const response = await axios.post(
      qtAcceptUrl,
      { quotation: quotationId, response: responseId },
      options,
    );
    console.log(response);
    return response.data;
  } catch (error) {
    console.error("Error Accepting the quotation: ", error);
    return null;
  }
}
export async function generateOTP(quotationId: string) {
  try {
    const url = `${BACKEND_URL}/delivery/generate-otp/`;
    const response = await axios.post(
      url,
      { quotation_id: quotationId },
      options,
    );

    return response.data;
  } catch (error) {
    console.error("Error generating the otp : ", error);
    return null;
  }
}
export async function verifyOTP(quotationId: string, otp: string) {
  try {
    const url = `${BACKEND_URL}/delivery/verify-otp/`;

    const response = await axios.post(
      url,
      {
        quotation_id: quotationId,
        otp: otp,
      },
      options,
    );

    return response.data;
  } catch (error) {
    console.error("Error generating the otp : ", error);
    return null;
  }
}
