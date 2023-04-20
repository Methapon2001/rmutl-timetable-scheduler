import { PUBLIC_API_HOST } from '$env/static/public';
import { refresh } from './auth';

export const createUser = async (
  data: Omit<API.User, 'id' | 'createdAt' | 'updatedAt'> & { password: string },
): Promise<API.User> => {
  const userSession = await refresh();

  const res = await fetch(`${PUBLIC_API_HOST}/api/user`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${userSession?.token.access}`,
    },
    body: JSON.stringify(data),
  });

  if (!res.ok) throw res;

  return (await res.json()).data as API.User;
};

export const deleteUser = async (data: Pick<API.User, 'id'>): Promise<API.User> => {
  const userSession = await refresh();

  const res = await fetch(`${PUBLIC_API_HOST}/api/user/${data.id}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${userSession?.token.access}`,
    },
  });

  if (!res.ok) throw res;

  return (await res.json()).data as API.User;
};

export const editUser = async (
  data: Omit<API.User, 'createdAt' | 'updatedAt'> & { password?: string },
): Promise<API.User> => {
  const userSession = await refresh();

  const res = await fetch(`${PUBLIC_API_HOST}/api/user/${data.id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${userSession?.token.access}`,
    },
    body: JSON.stringify(data),
  });

  if (!res.ok) throw res;

  return (await res.json()).data as API.User;
};
