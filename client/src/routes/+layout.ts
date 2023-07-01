import type { LayoutLoad } from './$types';
import { check, refresh } from '$lib/api/auth';

export const ssr = false;
export const prerender = true;

export const load = (async ({ fetch }) => {
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

  return {
    session: userSession,
  };
}) satisfies LayoutLoad;
