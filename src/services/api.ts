import { Platform } from 'react-native';
import Constants from 'expo-constants';
import { useAuthStore } from './authStore';

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}

const LOCALHOST_RE = /^(https?:\/\/)(localhost|127\.0\.0\.1)(?=[:/]|$)/i;

// On a phone/emulator "localhost" is the device itself, not the PC running the CRM server.
// Find the PC's address: the LAN IP Expo's dev server is reachable on, or the Android emulator alias.
function devMachineHost(): string {
  const hostUri = Constants.expoConfig?.hostUri || (Constants as any).manifest?.debuggerHost || (Constants as any).manifest2?.extra?.expoGo?.developer?.extra?.hostUri;
  const hostIp = hostUri ? String(hostUri).split(':')[0] : '';
  // Only a real IP works here (a --tunnel hostname doesn't forward port 3000).
  if (/^\d{1,3}(\.\d{1,3}){3}$/.test(hostIp) && hostIp !== '127.0.0.1') return hostIp;
  return Platform.OS === 'android' ? '10.0.2.2' : 'localhost';
}

export function getApiBaseUrl(): string {
  const envUrl = process.env.EXPO_PUBLIC_API_URL;

  if (Platform.OS === 'web') {
    return envUrl || 'http://localhost:3000';
  }

  if (envUrl) {
    // e.g. .env.development's http://localhost:3000 → http://192.168.x.x:3000 on a device
    return LOCALHOST_RE.test(envUrl) ? envUrl.replace(LOCALHOST_RE, `$1${devMachineHost()}`) : envUrl;
  }

  return `http://${devMachineHost()}:3000`;
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
