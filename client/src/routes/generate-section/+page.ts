import type { PageLoad } from './$types';
import { redirect } from '@sveltejs/kit';
import { PUBLIC_API_HOST } from '$env/static/public';

export const load = (async ({ fetch, parent }) => {
  const { session } = await parent();

  if (!session) throw redirect(302, '/login?redirect=/generate-section');

  const requestGroup = async () => {
    const res = await fetch(`${PUBLIC_API_HOST}/api/group?limit=9999`);
    const body = await res.json();
    return body as {
      data: API.Group[];
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

  const requestRoom = async () => {
    const res = await fetch(`${PUBLIC_API_HOST}/api/room?limit=9999`);
    const body = await res.json();
    return body as {
      data: API.Room[];
      limit: number;
      offset: number;
      total: number;
    };
  };

  const requestInstructor = async () => {
    const res = await fetch(`${PUBLIC_API_HOST}/api/instructor?limit=9999`);
    const body = await res.json();
    return body as {
      data: API.Instructor[];
      limit: number;
      offset: number;
      total: number;
    };
  };

  return {
    group: requestGroup(),
    plan: requestPlan(),
    room: requestRoom(),
    instructor: requestInstructor(),
  };
}) satisfies PageLoad;
