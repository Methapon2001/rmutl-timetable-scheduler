import type { PageLoad } from './$types';
import { error } from '@sveltejs/kit';
import { PUBLIC_API_HOST } from '$env/static/public';

export const load = (async ({ fetch, parent, depends }) => {
  const { session } = await parent();

  depends('data:scheduler');

  if (!session) throw error(401, { message: 'Unauthorized' });

  const schedulerData = async () => {
    return await fetch(`${PUBLIC_API_HOST}/api/scheduler?limit=9999`).then((res) => res.json());
  };

  const sectionData = async () => {
    return await fetch(
      `${PUBLIC_API_HOST}/api/section?limit=9999&createdByUserId=${session.user.id}`,
    ).then((res) => res.json());
  };

  return {
    scheduler: schedulerData() as Promise<{
      data: API.Scheduler[];
      limit: number;
      offset: number;
      total: number;
    }>,
    section: sectionData() as Promise<{
      data: API.Section[];
      limit: number;
      offset: number;
      total: number;
    }>,
  };
}) satisfies PageLoad;
