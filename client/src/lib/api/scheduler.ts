import { PUBLIC_API_HOST } from '$env/static/public';
import { refresh } from './auth';

export const createScheduler = async (
  data: Omit<
    API.Scheduler,
    'id' | 'section' | 'createdAt' | 'createdBy' | 'updatedAt' | 'updatedBy'
  > & {
    sectionId: string;
  },
): Promise<API.Scheduler> => {
  const userSession = await refresh();

  const res = await fetch(`${PUBLIC_API_HOST}/api/scheduler`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${userSession?.token.access}`,
    },
    body: JSON.stringify(data),
  });

  if (!res.ok) throw res;

  return (await res.json()).data as API.Scheduler;
};

export const deleteScheduler = async (data: Pick<API.Scheduler, 'id'>): Promise<API.Scheduler> => {
  const userSession = await refresh();

  const res = await fetch(`${PUBLIC_API_HOST}/api/scheduler/${data.id}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${userSession?.token.access}`,
    },
  });

  if (!res.ok) throw res;

  return (await res.json()).data as API.Scheduler;
};

export const editScheduler = async (
  data: Omit<API.Scheduler, 'section'  | 'createdAt' | 'createdBy' | 'updatedAt' | 'updatedBy'> & {
    sectionId: string;
  },
): Promise<API.Scheduler> => {
  const userSession = await refresh();

  const res = await fetch(`${PUBLIC_API_HOST}/api/scheduler/${data.id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${userSession?.token.access}`,
    },
    body: JSON.stringify(data),
  });

  if (!res.ok) throw res;

  return (await res.json()).data as API.Scheduler;
};
