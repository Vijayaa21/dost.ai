import { api } from './api';

export const getInviteCode = async (): Promise<string> => {
  const response = await api.get<{ invite_code: string }>('/users/invite-link/');
  return response.data.invite_code;
};

export const getFriends = async (): Promise<any[]> => {
  const response = await api.get('/users/friends/');
  return response.data;
};
