import { error } from '@sveltejs/kit';
import type { PageLoad } from './$types';

export const load = (async ({ parent }) => {
  const { session } = await parent();
  if (!session) throw error(401, { message: 'Unauthorized' });
}) satisfies PageLoad;
