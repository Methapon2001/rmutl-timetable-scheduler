import type { PageLoad } from './$types';
import { redirect } from '@sveltejs/kit';
import { PUBLIC_API_HOST } from '$env/static/public';

const api = new URL(`${PUBLIC_API_HOST}/api/subject`);

export const load = (async ({ fetch, parent, depends, url }) => {
  const { session } = await parent();

  depends('data:subject');

  if (!session) throw redirect(302, '/login?redirect=/subject');

  const page = url.searchParams.get('page');
  const search = url.searchParams.get('search');

  if (search && search.length > 0) {
    api.searchParams.set('search', search);
  } else {
    api.searchParams.delete('search');
  }

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
