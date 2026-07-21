import { Platform } from 'react-native';

// In Expo development, localhost doesn't work for physical devices.
// We use the host IP running Metro or default to localhost for web/simulators.
// Environment variables starting with EXPO_PUBLIC_ are automatically available.
export const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL;

import { useAuthStore } from './authStore';

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}

export async function apiCall<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const url = `${API_BASE_URL}${endpoint}`;

  const token = useAuthStore.getState().token;
  const headers: any = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  if (token) {
    headers['Cookie'] = `accessToken=${token}`;
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(url, {
      credentials: 'include',
      ...options,
      headers,
    });

    // Extract access token from cookies if present in response
    const setCookieHeader = response.headers.get('set-cookie');
    let extractedToken = null;
    if (setCookieHeader) {
      const match = setCookieHeader.match(/accessToken=([^;]+)/);
      if (match) {
        extractedToken = match[1];
      }
    }

    const contentType = response.headers.get('content-type');
    let data: any = null;
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
      if (extractedToken && data) {
        data.token = extractedToken;
      }
    } else {
      data = await response.text();
    }

    if (!response.ok) {
      return {
        success: false,
        error: data?.message || data?.error || `Request failed with status ${response.status}`,
      };
    }

    return {
      success: true,
      data,
    };
  } catch (error: any) {
    console.error(`API Error calling ${endpoint}:`, error);
    return {
      success: false,
      error: error.message || 'Network connection failed',
    };
  }
}
