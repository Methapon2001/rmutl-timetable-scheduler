import type { PageLoad } from './$types';
import { redirect } from '@sveltejs/kit';
import { PUBLIC_API_HOST } from '$env/static/public';

const api = new URL(`${PUBLIC_API_HOST}/api/info`);

export const load = (async ({ fetch, parent, depends, url }) => {
  const { session } = await parent();

  depends('data:info');

  if (!session) throw redirect(302, '/login?redirect=/info');

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
    info: body as {
      data: API.Info[];
      limit: number;
      offset: number;
      total: number;
    },
  };
}) satisfies PageLoad;
