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

  const reqSectionStatus = apiRequest('/api/request-section/status', fetch);
  const reqSection = apiRequest('/api/request-section', fetch);

  return {
    requestSectionStatus: reqSectionStatus.get<{ data: RequestSectionStatus }>(),
    requestSection: reqSection.get<{ data: RequestSection[] }>(),
  };
}) satisfies PageLoad;
