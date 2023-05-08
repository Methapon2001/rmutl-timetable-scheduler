import { PUBLIC_API_HOST } from '$env/static/public';
import { refresh } from './auth';

export const createSchedulerExam = async (
  data: Omit<
    API.SchedulerExam,
    'id' | 'exam' | 'createdAt' | 'createdBy' | 'updatedAt' | 'updatedBy'
  > & {
    examId: string;
  },
): Promise<API.SchedulerExam> => {
  const userSession = await refresh();

  const res = await fetch(`${PUBLIC_API_HOST}/api/scheduler-exam`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${userSession?.token.access}`,
    },
    body: JSON.stringify(data),
  });

  if (!res.ok) throw res;

  return (await res.json()).data as API.SchedulerExam;
};

export const deleteSchedulerExam = async (
  data: Pick<API.SchedulerExam, 'id'>,
): Promise<API.SchedulerExam> => {
  const userSession = await refresh();

  const res = await fetch(`${PUBLIC_API_HOST}/api/scheduler-exam/${data.id}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${userSession?.token.access}`,
    },
  });

  if (!res.ok) throw res;

  return (await res.json()).data as API.SchedulerExam;
};

export const editSchedulerExam = async (
  data: Omit<API.SchedulerExam, 'exam' | 'createdAt' | 'createdBy' | 'updatedAt' | 'updatedBy'> & {
    examId: string;
  },
): Promise<API.SchedulerExam> => {
  const userSession = await refresh();

  const res = await fetch(`${PUBLIC_API_HOST}/api/scheduler-exam/${data.id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${userSession?.token.access}`,
    },
    body: JSON.stringify(data),
  });

  if (!res.ok) throw res;

  return (await res.json()).data as API.SchedulerExam;
};
