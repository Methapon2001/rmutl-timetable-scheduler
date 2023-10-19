import type { PageLoad } from './$types';
import type { Instructor, Subject, LogInfo, ResponseDataInfo } from '$lib/types';
import { error } from '@sveltejs/kit';
import { env } from '$env/dynamic/public';
import apiRequest from '$lib/api';

const url = env.PUBLIC_API_HOST ? env.PUBLIC_API_HOST : window.location.origin;
const api = new URL(`${url}/api/request-section/check`);

export const load = (async ({ fetch, url }) => {
  const key = url.searchParams.get('key');

  if (key) {
    api.searchParams.set('key', key);
  } else {
    throw error(400, {
      message: 'Key is not provided.',
    });
  }

  const { data } = await fetch(api).then((r) => r.json());

  if (data === null) {
    throw error(400, {
      message: 'No form found.',
    });
  }

  const instructor = apiRequest('/api/instructor', fetch);
  const subject = apiRequest('/api/subject', fetch);

  return {
    key: key,
    instructor: instructor.get<ResponseDataInfo<LogInfo<Instructor>>>({ limit: `${9999}` }),
    subject: subject.get<ResponseDataInfo<LogInfo<Subject>>>({ limit: `${9999}` }),
  };
}) satisfies PageLoad;
