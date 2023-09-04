import type { PlanDetail } from '$lib/types';

export const restruct = (detail: (Omit<PlanDetail, 'id'> & { subjectId: string })[]) =>
  Object.values(
    detail
      .sort((a, b) => b.year - a.year || b.semester - a.semester)
      .reduce<{ [key: string]: { year: number; semester: number; subjectId: string[] } }>(
        (acc, obj) => {
          const key = `${obj.year}-${obj.semester}`;
          if (!acc[key]) {
            acc[key] = { year: obj.year, semester: obj.semester, subjectId: [] };
          }
          acc[key].subjectId.push(obj.subjectId);
          return acc;
        },
        {},
      ),
  );
