import api from './api';
import { LoginCredentials, RegisterData, OnboardingData, User, AuthTokens } from '../types';

export const authService = {
  async login(credentials: LoginCredentials): Promise<AuthTokens> {
    const response = await api.post('/auth/login/', credentials);
    return response.data;
  },

  async register(data: RegisterData): Promise<{ message: string; user: User }> {
    const response = await api.post('/auth/register/', data);
    return response.data;
  },

  async getProfile(): Promise<User> {
    const response = await api.get('/auth/profile/');
    return response.data;
  },

  async updateProfile(data: Partial<User>): Promise<User> {
    const response = await api.patch('/auth/profile/', data);
    return response.data;
  },

  async completeOnboarding(data: OnboardingData): Promise<{ message: string; user: User }> {
    const response = await api.post('/auth/onboarding/', data);
    return response.data;
  },

  async changePassword(oldPassword: string, newPassword: string): Promise<void> {
    await api.post('/auth/change-password/', {
      old_password: oldPassword,
      new_password: newPassword,
    });
  },

  async deleteAccount(): Promise<void> {
    await api.delete('/auth/delete-account/');
  },
};
