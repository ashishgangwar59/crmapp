import { Platform } from 'react-native';
import Constants from 'expo-constants';
import { useAuthStore } from './authStore';

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}

export function getApiBaseUrl(): string {
  if (process.env.EXPO_PUBLIC_API_URL && !process.env.EXPO_PUBLIC_API_URL.includes('localhost') && !process.env.EXPO_PUBLIC_API_URL.includes('127.0.0.1')) {
    return process.env.EXPO_PUBLIC_API_URL;
  }

  if (Platform.OS === 'web') {
    return process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000';
  }

  // Dynamic host detection for Mobile (Android Emulator / Physical Device via Expo Go)
  const hostUri = Constants.expoConfig?.hostUri || (Constants as any).manifest?.debuggerHost || (Constants as any).manifest2?.extra?.expoGo?.developer?.extra?.hostUri;
  if (hostUri) {
    const hostIp = hostUri.split(':')[0];
    if (hostIp && hostIp !== 'localhost' && hostIp !== '127.0.0.1') {
      return `http://${hostIp}:3000`;
    }
  }

  if (Platform.OS === 'android') {
    return 'http://10.0.2.2:3000';
  }

  return 'http://localhost:3000';
}

export async function apiCall<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const baseUrl = getApiBaseUrl();
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
      // useAuthStore.getState().clearAuth();
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
