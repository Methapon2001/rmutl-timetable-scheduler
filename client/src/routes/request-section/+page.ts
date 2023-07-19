import type { PageLoad } from './$types';
import { redirect } from '@sveltejs/kit';
import { PUBLIC_API_HOST } from '$env/static/public';

const api = new URL(`${PUBLIC_API_HOST}/api/request-section/status`);

export const load = (async ({ fetch, parent, depends }) => {
  const { session } = await parent();

  depends('data:request-section');

  if (!session) throw redirect(302, '/login?redirect=/request-section');

  const requestRequestSectionStatus = async () => {
    const res = await fetch(api, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${session?.token.access}`,
      },
    });
    const body = await res.json();
    return body as {
      data: API.OpenedRequestSection;
    };
  };

  const requestRequestSection = async () => {
    const res = await fetch(`${PUBLIC_API_HOST}/api/request-section?limit=9999`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${session?.token.access}`,
      },
    });
    const body = await res.json();
    return body as {
      data: API.RequestSection[];
    };
  };

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

  const requestSubject = async () => {
    const res = await fetch(`${PUBLIC_API_HOST}/api/subject?limit=9999`);
    const body = await res.json();
    return body as {
      data: API.Subject[];
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
    requestSectionStatus: requestRequestSectionStatus(),
    requestSection: requestRequestSection(),
    lazy: {
      group: requestGroup(),
      room: requestRoom(),
      subject: requestSubject(),
      instructor: requestInstructor(),
    },
  };
}) satisfies PageLoad;
