import { PUBLIC_API_HOST } from '$env/static/public';
import { refresh } from './auth';

export async function exportSchedule(view: 'group' | 'instructor' | 'room', exam = false) {
  const userSession = await refresh();

  const res = await fetch(`${PUBLIC_API_HOST}/timetable${exam ? '-exam' : ''}/export/${view}`, {
    headers: {
      Authorization: `Bearer ${userSession?.token.access}`,
    },
  });
  const blob = await res.blob();

  const a = document.createElement('a');
  a.href = window.URL.createObjectURL(blob);
  a.download = `schedule${exam ? '-exam' : ''}-${view}`;
  a.click();
}
