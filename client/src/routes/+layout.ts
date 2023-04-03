import type { LayoutLoad } from './$types';
import { check, refresh } from '$lib/api/auth';

export const ssr = false;

export const load = (async ({ fetch }) => {
  let userSession: API.Session | null = null;

  try {
    userSession = (await check(fetch)) ?? (await refresh(fetch));
  } catch (err) {
    console.log(err);
  }

  return {
    session: userSession,
  };
}) satisfies LayoutLoad;
