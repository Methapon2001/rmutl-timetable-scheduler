import { PUBLIC_API_HOST } from '$env/static/public';
import { refresh } from './auth';

export const createCourse = async (
  data: Omit<
    API.Course,
    'id' | 'detail' | 'createdAt' | 'createdBy' | 'updatedAt' | 'updatedBy'
  > & {
    detail: {
      subjectId: API.Course['detail'][number]['subject']['id'];
      type: API.Course['detail'][number]['type'];
    }[];
  },
): Promise<API.Course> => {
  const userSession = await refresh();

  const res = await fetch(`${PUBLIC_API_HOST}/api/course`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${userSession?.token.access}`,
    },
    body: JSON.stringify(data),
  });

  if (!res.ok) throw res;

  return (await res.json()).data as API.Course;
};

export const deleteCourse = async (data: Pick<API.Course, 'id'>): Promise<API.Course> => {
  const userSession = await refresh();

  const res = await fetch(`${PUBLIC_API_HOST}/api/course/${data.id}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${userSession?.token.access}`,
    },
  });

  if (!res.ok) throw res;

  return (await res.json()).data as API.Course;
};

export const editCourse = async (
  data: Omit<API.Course, 'detail' | 'createdAt' | 'createdBy' | 'updatedAt' | 'updatedBy'> & {
    detail: {
      subjectId: API.Course['detail'][number]['subject']['id'];
      type: API.Course['detail'][number]['type'];
    }[];
  },
): Promise<API.Course> => {
  const userSession = await refresh();

  const res = await fetch(`${PUBLIC_API_HOST}/api/course/${data.id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${userSession?.token.access}`,
    },
    body: JSON.stringify(data),
  });

  if (!res.ok) throw res;

  return (await res.json()).data as API.Course;
};
