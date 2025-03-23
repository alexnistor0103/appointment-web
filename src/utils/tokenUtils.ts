import axios from 'axios';

// Cookie-based token management
const ACCESS_TOKEN_NAME = 'appointment_access_token';
const REFRESH_TOKEN_NAME = 'appointment_refresh_token';

// Helper to set a cookie with expiration
const setCookie = (name: string, value: string, days: number) => {
  const expires = new Date();
  expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
  document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/;SameSite=Strict`;
};

// Helper to get a cookie by name
const getCookie = (name: string): string | null => {
  const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
  return match ? match[2] : null;
};

// Helper to remove a cookie
const removeCookie = (name: string) => {
  document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;SameSite=Strict`;
};

// Store access token in a cookie (short-lived, 15 minutes)
export const setAccessToken = (token: string) => {
  setCookie(ACCESS_TOKEN_NAME, token, 0.01); // 15 minutes in days
};

// Store refresh token in a cookie (longer-lived, 30 days)
export const setRefreshToken = (token: string) => {
  setCookie(REFRESH_TOKEN_NAME, token, 30);
};

// Get the current access token
export const getAccessToken = (): string | null => {
  return getCookie(ACCESS_TOKEN_NAME);
};

// Get the current refresh token
export const getRefreshToken = (): string | null => {
  return getCookie(REFRESH_TOKEN_NAME);
};

// Clear both tokens (for logout)
export const clearTokens = () => {
  removeCookie(ACCESS_TOKEN_NAME);
  removeCookie(REFRESH_TOKEN_NAME);
};

// Use the refresh token to get a new access token
export const refreshAccessToken = async (): Promise<void> => {
  const refreshToken = getRefreshToken();
  
  if (!refreshToken) {
    throw new Error('No refresh token available');
  }
  
  try {
    const response = await axios.post('http://localhost:8080/api/auth/refreshtoken', {
      refreshToken,
    });
    
    const { accessToken, refreshToken: newRefreshToken } = response.data;
    
    setAccessToken(accessToken);
    
    // If a new refresh token is provided, update it
    if (newRefreshToken) {
      setRefreshToken(newRefreshToken);
    }
  } catch (error) {
    clearTokens();
    throw error;
  }
};
