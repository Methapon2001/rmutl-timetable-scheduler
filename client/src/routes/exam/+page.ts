import type { PageLoad } from './$types';
import { redirect } from '@sveltejs/kit';
import { PUBLIC_API_HOST } from '$env/static/public';

const api = new URL(`${PUBLIC_API_HOST}/api/exam`);

export const load = (async ({ fetch, parent, depends, url }) => {
  const { session } = await parent();

  depends('data:exam');

  if (!session) throw redirect(302, '/login?redirect=/exam');

  const page = url.searchParams.get('page');
  const search = url.searchParams.get('search');

  if (search && search.length > 0) {
    api.searchParams.set('search', search);
  } else {
    api.searchParams.delete('search');
  }

  api.searchParams.set('limit', String(20));
  api.searchParams.set('offset', String((+(page ?? 1) - 1) * 20));

  const requestExam = async () => {
    const res = await fetch(api);
    const body = await res.json();
    return body as {
      data: API.Exam[];
      limit: number;
      offset: number;
      total: number;
    };
  };

  const requestSection = async () => {
    const res = await fetch(`${PUBLIC_API_HOST}/api/section?limit=9999`);
    const body = await res.json();
    return body as {
      data: API.Section[];
      limit: number;
      offset: number;
      total: number;
    };
  };

  const requestSectionExamFiltered = async () => {
    const res = await fetch(`${PUBLIC_API_HOST}/api/section?limit=9999&exam_filtered=1`);
    const body = await res.json();
    return body as {
      data: API.Section[];
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

  return {
    exam: requestExam(),
    lazy: {
      section: requestSection(),
      sectionExamFiltered: requestSectionExamFiltered(),
      instructor: requestInstructor(),
      room: requestRoom(),
    },
  };
}) satisfies PageLoad;
