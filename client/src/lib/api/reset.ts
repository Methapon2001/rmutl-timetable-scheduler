import { PUBLIC_API_HOST } from '$env/static/public';
import { refresh } from './auth';

export const resetData = async (target: 'scheduler' | 'schedulerExam' | 'exam' | 'section') => {
  const userSession = await refresh();

  const res = await fetch(`${PUBLIC_API_HOST}/api/reset?target=${target}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${userSession?.token.access}`,
    },
  });

  if (!res.ok) throw res;

  return await res.json();
};
