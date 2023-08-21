import { PUBLIC_API_HOST } from '$env/static/public';
import { info } from '$lib/stores';
import { refresh } from './auth';

let currentInfo: API.Info | undefined = undefined;
info.subscribe((v) => (currentInfo = v));

export const resetData = async (target: 'scheduler' | 'schedulerExam' | 'exam' | 'section') => {
  const userSession = await refresh();

  const res = await fetch(
    `${PUBLIC_API_HOST}/api/reset?target=${target}${
      currentInfo ? `&year=${currentInfo.year}&semester=${currentInfo.semester}` : ''
    }`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${userSession?.token.access}`,
      },
    },
  );

  if (!res.ok) throw res;

  return await res.json();
};
