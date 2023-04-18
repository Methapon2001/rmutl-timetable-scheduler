import { redirect } from '@sveltejs/kit';
import type { PageLoad } from './$types';
import { logout } from '$lib/api/auth';
import { invalidateAll } from '$app/navigation';

export const load = (async ({ parent, fetch }) => {
  const { session } = await parent();

  if (!session) throw redirect(301, '/login');

  await logout(fetch).catch((r: Response) => console.error(r));

  invalidateAll();

  throw redirect(301, '/login');
}) satisfies PageLoad;
