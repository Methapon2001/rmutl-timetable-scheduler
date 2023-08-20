import type { PageLoad } from './$types';
import { redirect } from '@sveltejs/kit';
import { PUBLIC_API_HOST } from '$env/static/public';
import { info } from '$lib/stores';

const api = new URL(`${PUBLIC_API_HOST}/api/group`);

let currentInfo: API.Info | undefined = undefined;
info.subscribe((v) => (currentInfo = v));

export const load = (async ({ fetch, parent, depends, url }) => {
  const { session } = await parent();

  depends('data:group');

  if (!session) throw redirect(302, '/login?redirect=/group');

  const page = url.searchParams.get('page');
  const search = url.searchParams.get('search');

  if (search && search.length > 0) {
    api.searchParams.set('search', search);
  } else {
    api.searchParams.delete('search');
  }

  api.searchParams.set('limit', String(20));
  api.searchParams.set('offset', String((+(page ?? 1) - 1) * 20));

  if (currentInfo !== undefined) {
    api.searchParams.set('semester', currentInfo.semester.toString());
    api.searchParams.set('year', currentInfo.year.toString());
  }

  const requestGroup = async () => {
    const res = await fetch(api);
    const body = await res.json();
    return body as {
      data: API.Group[];
      limit: number;
      offset: number;
      total: number;
    };
  };

  const requestCourse = async () => {
    const res = await fetch(`${PUBLIC_API_HOST}/api/course?limit=9999`);
    const body = await res.json();
    return body as {
      data: API.Course[];
      limit: number;
      offset: number;
      total: number;
    };
  };

  const requestPlan = async () => {
    const res = await fetch(`${PUBLIC_API_HOST}/api/plan?limit=9999`);
    const body = await res.json();
    return body as {
      data: API.Plan[];
      limit: number;
      offset: number;
      total: number;
    };
  };

  return {
    group: requestGroup(),
    lazy: {
      course: requestCourse(),
      plan: requestPlan(),
    },
  };
}) satisfies PageLoad;
