import { PUBLIC_API_HOST } from '$env/static/public';
import { refresh } from './auth';

export const createPlan = async (
  data: Omit<
    API.Plan,
    'id' | 'course' | 'detail' | 'createdAt' | 'createdBy' | 'updatedAt' | 'updatedBy'
  > & {
    courseId: string;
    detail: {
      semester: number;
      year: number;
      subjectId: API.Plan['detail'][number]['subject']['id'];
    }[];
  },
): Promise<API.Plan> => {
  const userSession = await refresh();

  const res = await fetch(`${PUBLIC_API_HOST}/api/plan`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${userSession?.token.access}`,
    },
    body: JSON.stringify(data),
  });

  if (!res.ok) throw res;

  return (await res.json()).data as API.Plan;
};

export const deletePlan = async (data: Pick<API.Plan, 'id'>): Promise<API.Plan> => {
  const userSession = await refresh();

  const res = await fetch(`${PUBLIC_API_HOST}/api/plan/${data.id}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${userSession?.token.access}`,
    },
  });

  if (!res.ok) throw res;

  return (await res.json()).data as API.Plan;
};

export const editPlan = async (
  data: Omit<
    API.Plan,
    'detail' | 'course' | 'createdAt' | 'createdBy' | 'updatedAt' | 'updatedBy'
  > & {
    courseId: string;
    detail: {
      semester: number;
      year: number;
      subjectId: API.Plan['detail'][number]['subject']['id'];
    }[];
  },
): Promise<API.Plan> => {
  const userSession = await refresh();

  const res = await fetch(`${PUBLIC_API_HOST}/api/plan/${data.id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${userSession?.token.access}`,
    },
    body: JSON.stringify(data),
  });

  if (!res.ok) throw res;

  return (await res.json()).data as API.Plan;
};
