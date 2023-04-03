import { PUBLIC_API_HOST } from '$env/static/public';

// TODO: Login
// eslint-disable-next-line @typescript-eslint/no-empty-function
export const login = async () => {};

/**
 * Require fetch parameter as it will be used in load function of sveltekit to avoid warning
 * Default to window.fetch
 *
 * Reference: https://kit.svelte.dev/docs/load#making-fetch-requests
 */
export const check = async (fetch: typeof global.fetch = window.fetch) => {
  let userSession: API.Session | string | null = localStorage.getItem('session');

  if (userSession) {
    userSession = JSON.parse(userSession) as API.Session;

    const res = await fetch(`${PUBLIC_API_HOST}/auth/check`, {
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
  let userSession: API.Session | string | null = localStorage.getItem('session');

  if (userSession) {
    userSession = JSON.parse(userSession) as API.Session;

    if (userSession.user.exp * 1000 > Date.now()) {
      return userSession;
    }

    const res = await fetch(`${PUBLIC_API_HOST}/auth/refresh`, {
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

      localStorage.setItem('session', JSON.stringify(data));

      return data as API.Session;
    }

    if (!res.ok && res.status == 401) {
      localStorage.removeItem('session');
    }
  }

  return null;
};

// TODO: Logout
// eslint-disable-next-line @typescript-eslint/no-empty-function
export const logout = async () => {};
