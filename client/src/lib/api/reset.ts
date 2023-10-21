import type { Info } from '$lib/types';
import { env } from '$env/dynamic/public';
import { info } from '$lib/stores';
import { refresh } from './auth';

let currentInfo: Info | undefined = undefined;
info.subscribe((v) => (currentInfo = v));

export const resetData = async (target: 'scheduler' | 'schedulerExam' | 'exam' | 'section') => {
  const url = env.PUBLIC_API_HOST ? env.PUBLIC_API_HOST : window.location.origin;
  const userSession = await refresh();
  const param = new URLSearchParams({ target });

  if (currentInfo !== undefined) {
    param.set('semester', currentInfo.semester.toString());
    param.set('year', currentInfo.year.toString());
  }

  const res = await fetch(`${url}/api/reset?${param.toString()}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${userSession?.token.access}`,
    },
  });

  if (!res.ok) throw res;

  return await res.json();
};
