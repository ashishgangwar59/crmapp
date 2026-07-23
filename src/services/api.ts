import { Platform } from 'react-native';
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
  let baseUrl = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000';
  if (Platform.OS !== 'web' && (baseUrl.includes('localhost') || baseUrl.includes('127.0.0.1'))) {
    baseUrl = 'http://localhost:3000';
  }

  const url = `${baseUrl}${endpoint}`;
  const token = useAuthStore.getState().token;
  const headers: any = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  if (token && token !== 'mock-token' && token !== 'valid-session-token') {
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

    const errorMessage = data?.message || data?.error || '';

    // Only auto-logout if HTTP status is 401 or 403
    if ((response.status === 401 || response.status === 403) && !endpoint.includes('/api/auth/login')) {
      // console.warn(`Unauthenticated response (${response.status}) on ${endpoint}. Logging out user...`);
      useAuthStore.getState().clearAuth();
    }

    if (!response.ok) {
      return {
        success: false,
        error: errorMessage || `Request failed with status ${response.status}`,
      };
    }

    return {
      success: true,
      data,
    };
  } catch (error: any) {
    console.error(`API Error calling ${url}:`, error);
    return {
      success: false,
      error: error.message || 'Network connection failed',
    };
  }
}
