import type { PageLoad } from './$types';
import { redirect } from '@sveltejs/kit';
import apiRequest from '$lib/api';
import type { Instructor, Subject, User } from '$lib/types';

type RequestSectionStatus = { id: string; key: string; opener: User; createdAt: string };
type RequestSection = {
  id: string;
  number: number;
  subject: Subject;
  requester: Instructor;
  openedRequestSection: Omit<RequestSectionStatus, 'createdAt'>;
  createdAt: string;
};

export const load = (async ({ fetch, parent, depends }) => {
  const { session } = await parent();

  depends('data:request-section');

  if (!session) throw redirect(302, '/login?redirect=/request-section');

  const [requestSectionStatus, requestSection] = await Promise.all([
    apiRequest('/api/request-section/status', fetch).get<{
      data: RequestSectionStatus;
    }>(),
    apiRequest('/api/request-section', fetch).get<{ data: RequestSection[] }>(),
  ]);

  return {
    requestSectionStatus,
    requestSection,
  };
}) satisfies PageLoad;
