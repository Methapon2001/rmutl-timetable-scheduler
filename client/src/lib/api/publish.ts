import { PUBLIC_API_HOST } from '$env/static/public';
import { refresh } from './auth';

export const publish = async (
  data: {
    groupId?: string;
    instructorId?: string;
    roomId?: string;
  },
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
    body: JSON.stringify({ ...data, publish }),
  });

  if (!res.ok) throw res;

  return (await res.json()).data;
};
