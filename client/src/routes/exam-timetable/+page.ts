import type { PageLoad } from './$types';
import { error } from '@sveltejs/kit';
import { PUBLIC_API_HOST } from '$env/static/public';

export const load = (async ({ fetch, parent, depends }) => {
  const { session } = await parent();

  depends('data:scheduler-exam');

  if (!session) throw error(401, { message: 'Unauthorized' });

  const schedulerExamData = async () => {
    return await fetch(`${PUBLIC_API_HOST}/api/scheduler-exam?limit=9999`).then((res) =>
      res.json(),
    );
  };

  const examData = async () => {
    return await fetch(
      `${PUBLIC_API_HOST}/api/exam?limit=9999&createdByUserId=${session.user.id}`,
    ).then((res) => res.json());
  };

  return {
    schedulerExam: schedulerExamData() as Promise<{
      data: API.SchedulerExam[];
      limit: number;
      offset: number;
      total: number;
    }>,
    exam: examData() as Promise<{
      data: API.Exam[];
      limit: number;
      offset: number;
      total: number;
    }>,
  };
}) satisfies PageLoad;
