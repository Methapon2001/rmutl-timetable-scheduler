import type { PageLoad } from './$types';
import { error } from '@sveltejs/kit';
import { PUBLIC_API_HOST } from '$env/static/public';

const api = new URL(`${PUBLIC_API_HOST}/api/subject`);

export const load = (async ({ fetch, parent, depends, url }) => {
  const { session } = await parent();

  depends('data:subject');

  if (!session) throw error(401, { message: 'Unauthorized' });

  const search = url.searchParams.get('search');
  const page = url.searchParams.get('page');

  api.searchParams.set('name', search ?? '');
  api.searchParams.set('limit', String(20));
  api.searchParams.set('offset', String((+(page ?? 1) - 1) * 20));

  const res = await fetch(api);
  const body = await res.json();

  return {
    subject: body as {
      data: API.Subject[];
      limit: number;
      offset: number;
      total: number;
    },
  };
}) satisfies PageLoad;