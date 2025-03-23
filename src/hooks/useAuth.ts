import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { 
  login as loginAction, 
  register as registerAction,
  logout as logoutAction,
  getCurrentUser, 
  resetAuthError
} from '../store/authSlice';
import { RootState, AppDispatch } from '../store/store';
import { LoginRequest, RegisterRequest } from '../types';
import { getAccessToken } from '../utils/tokenUtils';

export const useAuth = () => {
  const dispatch = useDispatch<AppDispatch>(); // Use AppDispatch type here
  const navigate = useNavigate();
  const auth = useSelector((state: RootState) => state.auth);
  
  // Check authentication status on mount
  useEffect(() => {
    const token = getAccessToken();
    
    if (token && !auth.user) {
      // If we have a token but no user data, try to fetch the user
      dispatch(getCurrentUser());
    }
  }, [dispatch, auth.user]);
  
  // Login function
  const login = async (credentials: LoginRequest) => {
    try {
      await dispatch(loginAction(credentials)).unwrap();
      navigate('/dashboard');
      return true;
    } catch (error) {
      return false;
    }
  };
  
  // Register function
  const register = async (userData: RegisterRequest) => {
    try {
      await dispatch(registerAction(userData)).unwrap();
      return true;
    } catch (error) {
      return false;
    }
  };
  
  // Logout function
  const logout = async () => {
    await dispatch(logoutAction());
    navigate('/');
  };
  
  // Clear authentication errors
  const clearError = () => {
    dispatch(resetAuthError());
  };
  
  return {
    user: auth.user,
    isAuthenticated: auth.isAuthenticated,
    isLoading: auth.isLoading,
    error: auth.error,
    login,
    register,
    logout,
    clearError
  };
};
