import type { PageLoad } from './$types';
import type {
  Section,
  Group,
  Info,
  LogInfo,
  ResponseDataInfo,
  Room,
  Instructor,
  Subject,
  Exam,
  Building,
} from '$lib/types';

import { paginationRequestParams } from '$lib/utils/search';
import apiRequest from '$lib/api';

import { redirect } from '@sveltejs/kit';
import { info } from '$lib/stores';

let currentInfo: Info | undefined = undefined;
info.subscribe((v) => (currentInfo = v));

export const load = (async ({ fetch, parent, depends, url }) => {
  const { session } = await parent();

  depends('data:exam');

  if (!session) throw redirect(302, '/login?redirect=/exam');

  const exam = apiRequest('/api/exam', fetch);
  const param = paginationRequestParams(url);

  if (currentInfo !== undefined) {
    param.set('semester', currentInfo.semester.toString());
    param.set('year', currentInfo.year.toString());
  }

  return {
    exam: exam.get<
      ResponseDataInfo<
        LogInfo<
          Exam & {
            section: (Section & {
              group: Group | null;
              subject: Subject;
            })[];
            instructor: Instructor[];
            room: Room & { building: Building };
          }
        >
      >
    >(param),
    info: currentInfo,
  };
}) satisfies PageLoad;
