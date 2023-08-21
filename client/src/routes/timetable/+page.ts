import type { PageLoad } from "./$types";
import { redirect } from "@sveltejs/kit";
import { PUBLIC_API_HOST } from "$env/static/public";
import { info } from "$lib/stores";

let currentInfo: API.Info | undefined = undefined;
info.subscribe((v) => (currentInfo = v));

export const load = (async ({ fetch, parent, depends }) => {
  const { session } = await parent();

  depends("data:scheduler");

  if (!session) throw redirect(302, "/login?redirect=/timetable");

  const schedulerData = async () => {
    return await fetch(
      `${PUBLIC_API_HOST}/api/scheduler?limit=9999&${
        currentInfo
          ? `&year=${currentInfo.year}&semester=${currentInfo.semester}`
          : ""
      }`,
    ).then((res) => res.json());
  };

  const sectionData = async () => {
    return await fetch(
      `${PUBLIC_API_HOST}/api/section?limit=9999&createdByUserId=${
        session.user.id
      }${
        currentInfo
          ? `&year=${currentInfo.year}&semester=${currentInfo.semester}`
          : ""
      }`,
    ).then((res) => res.json());
  };

  const requestGroup = async () => {
    const res = await fetch(
      `${PUBLIC_API_HOST}/api/group?limit=9999${
        currentInfo
          ? `&year=${currentInfo.year}&semester=${currentInfo.semester}`
          : ""
      }`,
    );
    const body = await res.json();
    return body as {
      data: API.Group[];
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

  const requestSubject = async () => {
    const res = await fetch(`${PUBLIC_API_HOST}/api/subject?limit=9999`);
    const body = await res.json();
    return body as {
      data: API.Subject[];
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

  return {
    scheduler: schedulerData() as Promise<{
      data: API.Scheduler[];
      limit: number;
      offset: number;
      total: number;
    }>,
    section: sectionData() as Promise<{
      data: API.Section[];
      limit: number;
      offset: number;
      total: number;
    }>,
    lazy: {
      group: requestGroup(),
      room: requestRoom(),
      subject: requestSubject(),
      instructor: requestInstructor(),
      info: currentInfo,
    },
  };
}) satisfies PageLoad;
