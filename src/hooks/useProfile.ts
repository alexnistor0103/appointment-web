import { useState, useEffect } from 'react';
import { CountryEnum } from '../types';
import api from '../utils/axios';

interface UserProfile {
  id: number;
  email: string;
  country: CountryEnum;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  profileImageUrl?: string;
  active: boolean;
}

interface PasswordChangeRequest {
  oldPassword: string;
  newPassword: string;
  confirmPassword: string;
}

interface UseProfileReturn {
  profile: UserProfile | null;
  isLoading: boolean;
  error: string | null;
  fetchProfile: () => Promise<void>;
  updateProfile: (profileData: UserProfile) => Promise<UserProfile | null>;
  changePassword: (passwordData: PasswordChangeRequest) => Promise<boolean>;
  uploadProfileImage: (file: File) => Promise<UserProfile | null>;
  removeProfileImage: () => Promise<UserProfile | null>;
  clearError: () => void;
}

export const useProfile = (): UseProfileReturn => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const fetchProfile = async (): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await api.get<UserProfile>('/profile');
      setProfile(response.data);
      
      setIsLoading(false);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Eroare la încărcarea profilului');
      setIsLoading(false);
    }
  };
  
  const updateProfile = async (profileData: UserProfile): Promise<UserProfile | null> => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await api.put<UserProfile>('/profile', profileData);
      setProfile(response.data);
      
      setIsLoading(false);
      return response.data;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Eroare la actualizarea profilului');
      setIsLoading(false);
      return null;
    }
  };
  
  const changePassword = async (passwordData: PasswordChangeRequest): Promise<boolean> => {
    try {
      setIsLoading(true);
      setError(null);
      
      await api.post('/profile/change-password', passwordData);
      
      setIsLoading(false);
      return true;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Eroare la schimbarea parolei');
      setIsLoading(false);
      return false;
    }
  };
  
  const uploadProfileImage = async (file: File): Promise<UserProfile | null> => {
    try {
      setIsLoading(true);
      setError(null);
      
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await api.post<UserProfile>('/profile/profile-image', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      setProfile(response.data);
      setIsLoading(false);
      return response.data;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Eroare la încărcarea imaginii de profil');
      setIsLoading(false);
      return null;
    }
  };
  
  const removeProfileImage = async (): Promise<UserProfile | null> => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await api.delete<UserProfile>('/profile/profile-image');
      
      setProfile(response.data);
      setIsLoading(false);
      return response.data;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Eroare la ștergerea imaginii de profil');
      setIsLoading(false);
      return null;
    }
  };
  
  const clearError = () => {
    setError(null);
  };
  
  return {
    profile,
    isLoading,
    error,
    fetchProfile,
    updateProfile,
    changePassword,
    uploadProfileImage,
    removeProfileImage,
    clearError
  };
};