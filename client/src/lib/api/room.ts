import { PUBLIC_API_HOST } from '$env/static/public';
import { refresh } from './auth';

export const createRoom = async (
  data: Omit<
    API.Room,
    'id' | 'building' | 'createdAt' | 'createdBy' | 'updatedAt' | 'updatedBy'
  > & {
    buildingId: string;
  },
): Promise<API.Room> => {
  const userSession = await refresh();

  const res = await fetch(`${PUBLIC_API_HOST}/api/room`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${userSession?.token.access}`,
    },
    body: JSON.stringify(data),
  });

  if (!res.ok) throw res;

  return (await res.json()).data as API.Room;
};

export const deleteRoom = async (data: Pick<API.Room, 'id'>): Promise<API.Room> => {
  const userSession = await refresh();

  const res = await fetch(`${PUBLIC_API_HOST}/api/room/${data.id}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${userSession?.token.access}`,
    },
  });

  if (!res.ok) throw res;

  return (await res.json()).data as API.Room;
};

export const editRoom = async (
  data: Omit<API.Room, 'building' | 'createdAt' | 'createdBy' | 'updatedAt' | 'updatedBy' > & { buildingId: string; },
): Promise<API.Room> => {
  const userSession = await refresh();

  const res = await fetch(`${PUBLIC_API_HOST}/api/room/${data.id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${userSession?.token.access}`,
    },
    body: JSON.stringify(data),
  });

  if (!res.ok) throw res;

  return (await res.json()).data as API.Room;
};
