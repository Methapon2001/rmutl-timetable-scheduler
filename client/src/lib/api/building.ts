import { PUBLIC_API_HOST } from '$env/static/public';
import { refresh } from './auth';

export const createBuilding = async (
  data: Pick<API.Building, 'name' | 'code'>,
): Promise<API.Building> => {
  const userSession = await refresh();

  const res = await fetch(`${PUBLIC_API_HOST}/api/building`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${userSession?.token.access}`,
    },
    body: JSON.stringify(data),
  });

  if (!res.ok) throw res;

  return (await res.json()).data as API.Building;
};

export const deleteBuilding = async (
  data: Pick<API.Building, 'id'>,
): Promise<API.Building> => {
  const userSession = await refresh();

  const res = await fetch(`${PUBLIC_API_HOST}/api/building/${data.id}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${userSession?.token.access}`,
    },
  });

  if (!res.ok) throw res;

  return (await res.json()).data as API.Building;
};

export const editBuilding = async (
  data: Pick<API.Building, 'id' | 'name' | 'code'>,
): Promise<API.Building> => {
  const userSession = await refresh();

  const res = await fetch(`${PUBLIC_API_HOST}/api/building/${data.id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${userSession?.token.access}`,
    },
    body: JSON.stringify(data),
  });

  if (!res.ok) throw res;

  return (await res.json()).data as API.Building;
};
