import type { PageLoad } from './$types';
import { PUBLIC_API_HOST } from '$env/static/public';

export const load = (async ({ fetch, depends }) => {
  depends('data:scheduler');

  const schedulerData = async () => {
    return await fetch(`${PUBLIC_API_HOST}/api/scheduler?limit=9999&publish=true`).then((res) =>
      res.json(),
    );
  };

  return {
    scheduler: schedulerData() as Promise<{
      data: API.Scheduler[];
      limit: number;
      offset: number;
      total: number;
    }>,
  };
}) satisfies PageLoad;
