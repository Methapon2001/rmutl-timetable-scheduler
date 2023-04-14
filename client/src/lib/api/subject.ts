import { PUBLIC_API_HOST } from '$env/static/public';
import { refresh } from './auth';

export const createSubject = async (
  data: Omit<API.Subject, 'id' | 'createdAt' | 'createdBy' | 'updatedAt' | 'updatedBy'>,
): Promise<API.Subject> => {
  const userSession = await refresh();

  const res = await fetch(`${PUBLIC_API_HOST}/api/subject`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${userSession?.token.access}`,
    },
    body: JSON.stringify(data),
  });

  if (!res.ok) throw res;

  return (await res.json()).data as API.Subject;
};

export const deleteSubject = async (data: Pick<API.Subject, 'id'>): Promise<API.Subject> => {
  const userSession = await refresh();

  const res = await fetch(`${PUBLIC_API_HOST}/api/subject/${data.id}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${userSession?.token.access}`,
    },
  });

  if (!res.ok) throw res;

  return (await res.json()).data as API.Subject;
};

export const editSubject = async (
  data: Omit<API.Subject, 'createdAt' | 'createdBy' | 'updatedAt' | 'updatedBy'>,
): Promise<API.Subject> => {
  const userSession = await refresh();

  const res = await fetch(`${PUBLIC_API_HOST}/api/subject/${data.id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${userSession?.token.access}`,
    },
    body: JSON.stringify(data),
  });

  if (!res.ok) throw res;

  return (await res.json()).data as API.Subject;
};
