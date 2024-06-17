import type { PageLoad } from './$types';
import type { Instructor, Subject, LogInfo, ResponseDataInfo } from '$lib/types';
import { error } from '@sveltejs/kit';
import apiRequest from '$lib/api';

export const load = (async ({ fetch, url }) => {
  const key = url.searchParams.get('key');

  if (!key) {
    throw error(400, { message: 'Key is not provided.' });
  }

  const ret = await apiRequest('/api/request-section/check').get<Record<string, unknown>>({ key });

  if (ret.data === null) {
    throw error(400, { message: 'No form found.' });
  }

  const [instructor, subject] = await Promise.all([
    apiRequest('/api/instructor', fetch).get<ResponseDataInfo<LogInfo<Instructor>>>({
      limit: `${9999}`,
    }),
    apiRequest('/api/subject', fetch).get<ResponseDataInfo<LogInfo<Subject>>>({ limit: `${9999}` }),
  ]);

  return { key, instructor, subject };
}) satisfies PageLoad;
