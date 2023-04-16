import { PUBLIC_API_HOST } from '$env/static/public';
import { refresh } from './auth';

export const createInstructor = async (
  data: Omit<API.Instructor, 'id' | 'createdAt' | 'createdBy' | 'updatedAt' | 'updatedBy'>,
): Promise<API.Instructor> => {
  const userSession = await refresh();

  const res = await fetch(`${PUBLIC_API_HOST}/api/instructor`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${userSession?.token.access}`,
    },
    body: JSON.stringify(data),
  });

  if (!res.ok) throw res;

  return (await res.json()).data as API.Instructor;
};

export const deleteInstructor = async (
  data: Pick<API.Instructor, 'id'>,
): Promise<API.Instructor> => {
  const userSession = await refresh();

  const res = await fetch(`${PUBLIC_API_HOST}/api/instructor/${data.id}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${userSession?.token.access}`,
    },
  });

  if (!res.ok) throw res;

  return (await res.json()).data as API.Instructor;
};

export const editInstructor = async (
  data: Omit<API.Instructor, 'createdAt' | 'createdBy' | 'updatedAt' | 'updatedBy'>,
): Promise<API.Instructor> => {
  const userSession = await refresh();

  const res = await fetch(`${PUBLIC_API_HOST}/api/instructor/${data.id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${userSession?.token.access}`,
    },
    body: JSON.stringify(data),
  });

  if (!res.ok) throw res;

  return (await res.json()).data as API.Instructor;
};
