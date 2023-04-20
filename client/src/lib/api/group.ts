import { PUBLIC_API_HOST } from '$env/static/public';
import { refresh } from './auth';

export const createGroup = async (
  data: Omit<API.Group, 'id' | 'course' | 'createdAt' | 'createdBy' | 'updatedAt' | 'updatedBy'> & {
    courseId: string;
  },
): Promise<API.Group> => {
  const userSession = await refresh();

  const res = await fetch(`${PUBLIC_API_HOST}/api/group`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${userSession?.token.access}`,
    },
    body: JSON.stringify(data),
  });

  if (!res.ok) throw res;

  return (await res.json()).data as API.Group;
};

export const deleteGroup = async (data: Pick<API.Group, 'id'>): Promise<API.Group> => {
  const userSession = await refresh();

  const res = await fetch(`${PUBLIC_API_HOST}/api/group/${data.id}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${userSession?.token.access}`,
    },
  });

  if (!res.ok) throw res;

  return (await res.json()).data as API.Group;
};

export const editGroup = async (
  data: Omit<API.Group, 'course' | 'createdAt' | 'createdBy' | 'updatedAt' | 'updatedBy'> & {
    courseId: string;
  },
): Promise<API.Group> => {
  const userSession = await refresh();

  const res = await fetch(`${PUBLIC_API_HOST}/api/group/${data.id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${userSession?.token.access}`,
    },
    body: JSON.stringify(data),
  });

  if (!res.ok) throw res;

  return (await res.json()).data as API.Group;
};
