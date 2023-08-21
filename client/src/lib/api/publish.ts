import { PUBLIC_API_HOST } from '$env/static/public';
import { refresh } from './auth';

export const publish = async (
  publish: boolean,
): Promise<{
  count: number;
}> => {
  const userSession = await refresh();

  const res = await fetch(`${PUBLIC_API_HOST}/api/publish`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${userSession?.token.access}`,
    },
    body: JSON.stringify({ publish }),
  });

  if (!res.ok) throw res;

  return (await res.json()).data;
};
export const publishExam = async (
  publish: boolean,
): Promise<{
  count: number;
}> => {
  const userSession = await refresh();

  const res = await fetch(`${PUBLIC_API_HOST}/api/publish-exam`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${userSession?.token.access}`,
    },
    body: JSON.stringify({ publish }),
  });

  if (!res.ok) throw res;

  return (await res.json()).data;
};
