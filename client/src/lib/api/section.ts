import { PUBLIC_API_HOST } from '$env/static/public';
import { refresh } from './auth';

export const createSection = async (data: {
  type: string;
  subjectId: string;
  groupId: string;
  manual: boolean;
  section: {
    roomId: string;
    instructor: { id: string }[];
  }[];
}): Promise<API.Section> => {
  const userSession = await refresh();

  const res = await fetch(`${PUBLIC_API_HOST}/api/section`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${userSession?.token.access}`,
    },
    body: JSON.stringify(data),
  });

  if (!res.ok) throw res;

  return (await res.json()).data as API.Section;
};

export const deleteSection = async (data: Pick<API.Section, 'id'>): Promise<API.Section> => {
  const userSession = await refresh();

  const res = await fetch(`${PUBLIC_API_HOST}/api/section/${data.id}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${userSession?.token.access}`,
    },
  });

  if (!res.ok) throw res;

  return (await res.json()).data as API.Section;
};

export const editSection = async (
  data: Pick<API.Section, 'id' | 'instructor'> & {
    groupId: string;
    roomId: string;
  },
): Promise<API.Section> => {
  const userSession = await refresh();

  const res = await fetch(`${PUBLIC_API_HOST}/api/section/${data.id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${userSession?.token.access}`,
    },
    body: JSON.stringify(data),
  });

  if (!res.ok) throw res;

  return (await res.json()).data as API.Section;
};
