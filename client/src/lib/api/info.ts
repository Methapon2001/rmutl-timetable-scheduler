import { PUBLIC_API_HOST } from '$env/static/public';
import { refresh } from './auth';

export const createInfo = async (data: Omit<API.Info, 'id'>): Promise<API.Info> => {
  const userSession = await refresh();

  const res = await fetch(`${PUBLIC_API_HOST}/api/info`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${userSession?.token.access}`,
    },
    body: JSON.stringify(data),
  });

  if (!res.ok) throw res;

  return (await res.json()).data as API.Info;
};

export const deleteInfo = async (data: Pick<API.Info, 'id'>): Promise<API.Info> => {
  const userSession = await refresh();

  const res = await fetch(`${PUBLIC_API_HOST}/api/info/${data.id}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${userSession?.token.access}`,
    },
  });

  if (!res.ok) throw res;

  return (await res.json()).data as API.Info;
};

export const editInfo = async (data: API.Info): Promise<API.Info> => {
  const userSession = await refresh();

  const res = await fetch(`${PUBLIC_API_HOST}/api/info/${data.id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${userSession?.token.access}`,
    },
    body: JSON.stringify(data),
  });

  if (!res.ok) throw res;

  return (await res.json()).data as API.Info;
};
