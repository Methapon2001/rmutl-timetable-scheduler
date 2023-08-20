import type { LayoutLoad } from './$types';
import { check, refresh } from '$lib/api/auth';
import { PUBLIC_API_HOST } from '$env/static/public';

export const ssr = false;
export const prerender = true;
export const trailingSlash = 'always';

export const load = (async ({ fetch, depends }) => {
  let userSession: API.Session | null = null;

  try {
    userSession = (await check(fetch)) ?? (await refresh(fetch));
  } catch (err) {
    if (err instanceof Response) {
      console.error(err.json());
    } else {
      console.error(err);
    }
  }
  const infoData = async () => {
    return await fetch(`${PUBLIC_API_HOST}/api/info`).then((res) => res.json());
  };

  return {
    session: userSession,
    info: infoData() as Promise<{
      data: API.Info[];
      limit: number;
      offset: number;
      total: number;
    }>,
  };
}) satisfies LayoutLoad;
