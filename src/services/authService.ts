// Mock Auth Service for Demo
import { mockAuthService } from './mockServices';

// Use mock services for demo
export const registerUser = mockAuthService.registerUser;
export const loginUser = mockAuthService.loginUser;
export const logoutUser = mockAuthService.logoutUser;

// Mock onAuthChange function
export const onAuthChange = (callback: (user: AuthUser | null) => void) => {
  // For mock services, we don't have real auth state changes
  // Just call the callback immediately with null (no user logged in initially)
  callback(null);
  
  // Return a dummy unsubscribe function
  return () => {};
};

// Export the AuthUser interface
export interface AuthUser {
  id: string;
  email: string;
  username: string;
  displayName: string;
  createdAt: string;
}