import type { PageLoad } from './$types';
import { redirect } from '@sveltejs/kit';
import { PUBLIC_API_HOST } from '$env/static/public';

export const load = (async ({ fetch, parent, depends }) => {
  const { session } = await parent();

  depends('data:scheduler-exam');

  if (!session) throw redirect(302, '/login?redirect=/exam-timetable');

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
    lazy: {
      section: requestSection(),
      sectionExamFiltered: requestSectionExamFiltered(),
      instructor: requestInstructor(),
      room: requestRoom(),
    },
  };
}) satisfies PageLoad;
