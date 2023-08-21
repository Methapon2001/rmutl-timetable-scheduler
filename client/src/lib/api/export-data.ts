import { PUBLIC_API_HOST } from '$env/static/public';
import { refresh } from './auth';
import { info } from "$lib/stores";

let currentInfo: API.Info | undefined = undefined;
info.subscribe((v) => (currentInfo = v));

export async function exportSchedule(view: 'group' | 'instructor' | 'room') {
  const userSession = await refresh();

  const res = await fetch(`${PUBLIC_API_HOST}/timetable/export/${view}${
       currentInfo ? `?year=${currentInfo.year}&semester=${currentInfo.semester}` : ''
  }`, {
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
  const userSession = await refresh();

  const res = await fetch(`${PUBLIC_API_HOST}/timetable-exam/export?midtermDate=${midtermDate}&finalDate=${finalDate}${
       currentInfo ? `&year=${currentInfo.year}&semester=${currentInfo.semester}` : ''
  }`, {
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