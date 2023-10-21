import type { Session } from '$lib/types';
import { env } from '$env/dynamic/public';
import jwtDecode from 'jwt-decode';

export const login = async (credential: { username: string; password: string }) => {
  const url = env.PUBLIC_API_HOST ? env.PUBLIC_API_HOST : window.location.origin;
  const res = await fetch(`${url}/api/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(credential),
  }).then((res: Response) => {
    if (!res.ok && res.status != 401) throw res;
    return res;
  });

  if (res.ok) {
    const data = await res.json();
    const session = {
      token: data.token,
      user: jwtDecode(data.token.access),
    };

    localStorage.setItem('session', JSON.stringify(session));

    return session as Session;
  }

  if (!res.ok && res.status == 401) {
    return null;
  }
};

/**
 * Require fetch parameter as it will be used in load function of sveltekit to avoid warning
 * Default to window.fetch
 *
 * Reference: https://kit.svelte.dev/docs/load#making-fetch-requests
 */
export const check = async (fetch: typeof global.fetch = window.fetch) => {
  const url = env.PUBLIC_API_HOST ? env.PUBLIC_API_HOST : window.location.origin;
  let userSession: Session | string | null = localStorage.getItem('session');

  if (userSession) {
    userSession = JSON.parse(userSession) as Session;

    const res = await fetch(`${url}/api/auth/check`, {
      headers: {
        Authorization: `Bearer ${userSession.token.access}`,
      },
    }).then((res: Response) => {
      if (!res.ok) throw res;
      return res;
    });

    if (res.ok) {
      const data = await res.json();

      if (data.isAuthenticated) {
        return userSession;
      }
    }
  }

  return null;
};

/**
 * Require fetch parameter as it will be used in load function of sveltekit to avoid warning
 * Default to window.fetch
 *
 * Reference: https://kit.svelte.dev/docs/load#making-fetch-requests
 */
export const refresh = async (fetch: typeof global.fetch = window.fetch) => {
  const url = env.PUBLIC_API_HOST ? env.PUBLIC_API_HOST : window.location.origin;
  let userSession: Session | string | null = localStorage.getItem('session');

  if (userSession) {
    userSession = JSON.parse(userSession) as Session;

    if (userSession.user.exp * 1000 > Date.now()) {
      return userSession;
    }

    const res = await fetch(`${url}/api/auth/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        token: userSession.token.refresh,
      }),
    }).then((res: Response) => {
      if (!res.ok && res.status != 401) throw res;
      return res;
    });

    if (res.ok) {
      const data = await res.json();
      const session = {
        token: data.token,
        user: jwtDecode(data.token.access),
      };

      localStorage.setItem('session', JSON.stringify(session));

      return session as Session;
    }

    if (!res.ok && res.status == 401) {
      localStorage.removeItem('session');
    }
  }

  return null;
};

export const logout = async (fetch: typeof global.fetch = window.fetch) => {
  const url = env.PUBLIC_API_HOST ? env.PUBLIC_API_HOST : window.location.origin;
  const userSession: Session | null = await refresh(fetch);

  if (!userSession) return null;

  await fetch(`${url}/api/auth/logout`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${userSession.token.access}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      token: userSession.token.refresh,
    }),
  }).then((res: Response) => {
    if (!res.ok) throw res;
    return res;
  });

  localStorage.removeItem('session');

  return userSession;
};
