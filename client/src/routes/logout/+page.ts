import type { PageLoad } from './$types';
import { redirect } from '@sveltejs/kit';
import { logout } from '$lib/api/auth';
import { goto, invalidateAll } from '$app/navigation';

export const load = (async ({ parent, fetch }) => {
  const { session } = await parent();

  if (!session) throw redirect(302, '/login');

  await logout(fetch).catch((r: Response) => console.error(r));
  await invalidateAll();

  goto('/login');
}) satisfies PageLoad;
