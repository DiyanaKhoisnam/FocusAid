// lib/api.js - API configuration and utilities

// Backend API base URL
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8001";

/**
 * Make an API request to the backend
 * @param {string} endpoint - API endpoint (e.g., "/auth/login")
 * @param {object} options - Fetch options
 * @returns {Promise<Response>}
 */
export async function apiRequest(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  const defaultHeaders = {
    "Content-Type": "application/json",
  };

  // Add authorization header if token exists
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  if (token) {
    defaultHeaders["Authorization"] = `Bearer ${token}`;
  }

  const config = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  };

  // Debug logging
  if (typeof window !== "undefined") {
    console.log("API Request:", {
      url,
      method: options.method || "GET",
      headers: config.headers,
      body: options.body
    });
  }

  try {
    const response = await fetch(url, config);
    
    // Debug logging
    if (typeof window !== "undefined") {
      console.log("API Response:", {
        url,
        status: response.status,
        statusText: response.statusText,
        ok: response.ok
      });
    }
    
    return response;
  } catch (error) {
    // Enhanced error logging
    if (typeof window !== "undefined") {
      console.error("API Request Failed:", {
        url,
        error: error.message,
        errorType: error.name,
        stack: error.stack
      });
    }
    throw error;
  }
}

/**
 * Get error message from API response
 * @param {Response} response - Fetch response object
 * @returns {Promise<string>}
 */
export async function getErrorMessage(response) {
  try {
    const data = await response.json();
    // FastAPI returns errors in 'detail' field
    return data.detail || data.message || "An error occurred";
  } catch (err) {
    return response.statusText || "An error occurred";
  }
}

/**
 * Store authentication token
 * @param {string} token - Access token
 */
export function setAuthToken(token) {
  if (typeof window !== "undefined") {
    localStorage.setItem("token", token);
  }
}

/**
 * Get authentication token
 * @returns {string|null}
 */
export function getAuthToken() {
  if (typeof window !== "undefined") {
    return localStorage.getItem("token");
  }
  return null;
}

/**
 * Remove authentication token
 */
export function removeAuthToken() {
  if (typeof window !== "undefined") {
    localStorage.removeItem("token");
  }
}

