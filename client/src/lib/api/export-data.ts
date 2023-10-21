import type { Info } from '$lib/types';
import { env } from '$env/dynamic/public';
import { info } from '$lib/stores';
import { refresh } from './auth';

let currentInfo: Info | undefined = undefined;
info.subscribe((v) => (currentInfo = v));

export async function exportSchedule(view: 'group' | 'instructor' | 'room') {
  const url = env.PUBLIC_API_HOST ? env.PUBLIC_API_HOST : window.location.origin;
  const userSession = await refresh();
  const param = new URLSearchParams();

  if (currentInfo !== undefined) {
    param.set('semester', currentInfo.semester.toString());
    param.set('year', currentInfo.year.toString());
  }

  const res = await fetch(`${url}/timetable/export/${view}?${param.toString()}`, {
    headers: {
      Authorization: `Bearer ${userSession?.token.access}`,
    },
  });
  const blob = await res.blob();

  const a = document.createElement('a');
  a.href = window.URL.createObjectURL(blob);
  a.download = `schedule-${view}`;
  a.click();
}

export async function exportScheduleExam(midtermDate: string, finalDate: string) {
  const url = env.PUBLIC_API_HOST ? env.PUBLIC_API_HOST : window.location.origin;
  const userSession = await refresh();
  const param = new URLSearchParams({ midtermDate, finalDate });

  if (currentInfo !== undefined) {
    param.set('semester', currentInfo.semester.toString());
    param.set('year', currentInfo.year.toString());
  }

  const res = await fetch(`${url}/timetable-exam/export?${param.toString()}`, {
    headers: {
      Authorization: `Bearer ${userSession?.token.access}`,
    },
  });
  const blob = await res.blob();

  const a = document.createElement('a');
  a.href = window.URL.createObjectURL(blob);
  a.download = `schedule-exam`;
  a.click();
}
