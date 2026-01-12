import api from './api';

export const getInviteCode = async (): Promise<string> => {
  const response = await api.get<{ invite_code: string }>('/auth/invite-link/');
  return response.data.invite_code;
};

export const getFriends = async (): Promise<any[]> => {
  const response = await api.get('/auth/friends/');
  // Handle both paginated response and plain array
  if (Array.isArray(response.data)) {
    return response.data;
  }
  // DRF paginated response has results array
  return response.data.results || [];
};
