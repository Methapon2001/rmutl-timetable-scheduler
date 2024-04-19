import type { LayoutLoad } from './$types';
import type { Info, LogInfo, ResponseDataInfo, Session } from '$lib/types';
import { check, refresh } from '$lib/api/auth';
import apiRequest from '$lib/api';

export const ssr = false;
export const prerender = true;
export const trailingSlash = 'always';

export const load = (async ({ fetch }) => {
  let userSession: Session | null = null;

  try {
    userSession = (await check(fetch)) ?? (await refresh(fetch));
  } catch (err) {
    if (err instanceof Response) {
      console.error(err.json());
    } else {
      console.error(err);
    }
  }

  const info = apiRequest('/api/info', fetch);

  return {
    session: userSession,
    info: info.get<ResponseDataInfo<LogInfo<Info>>>({ limit: '9999' }),
  };
}) satisfies LayoutLoad;
