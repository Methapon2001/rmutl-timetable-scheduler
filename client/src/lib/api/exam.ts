import { PUBLIC_API_HOST } from '$env/static/public';
import { refresh } from './auth';

export const createExam = async (data: {
  roomId: string;
  section: {
    id: string;
  }[];
  instructor: {
    id: string;
  }[];
}): Promise<API.Exam> => {
  const userSession = await refresh();

  const res = await fetch(`${PUBLIC_API_HOST}/api/exam`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${userSession?.token.access}`,
    },
    body: JSON.stringify(data),
  });

  if (!res.ok) throw res;

  return (await res.json()).data as API.Exam;
};

export const deleteExam = async (data: Pick<API.Exam, 'id'>): Promise<API.Exam> => {
  const userSession = await refresh();

  const res = await fetch(`${PUBLIC_API_HOST}/api/exam/${data.id}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${userSession?.token.access}`,
    },
  });

  if (!res.ok) throw res;

  return (await res.json()).data as API.Exam;
};

export const editExam = async (data: {
  id: string;
  roomId: string;
  section: {
    id: string;
  }[];
  instructor: {
    id: string;
  }[];
}): Promise<API.Exam> => {
  const userSession = await refresh();

  const res = await fetch(`${PUBLIC_API_HOST}/api/exam/${data.id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${userSession?.token.access}`,
    },
    body: JSON.stringify(data),
  });

  if (!res.ok) throw res;

  return (await res.json()).data as API.Exam;
};
