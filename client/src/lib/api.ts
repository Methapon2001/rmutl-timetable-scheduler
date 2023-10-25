import { env } from '$env/dynamic/public';
import type * as types from './types';
import { refresh } from './api/auth';

/**
 * Store list of resource and its body data type.
 */
type RouteBody = {
  '/api/instructor': types.Instructor;
  '/api/subject': types.Subject;
  '/api/building': types.Building;
  '/api/room': types.Room & {
    buildingId: types.Building['id'];
  };
  '/api/course': types.Course & {
    detail: (Omit<types.CourseDetail, 'id'> & { subjectId: types.Subject['id'] })[];
  };
  '/api/plan': types.Plan & {
    detail: (Omit<types.PlanDetail, 'id'> & { subjectId: types.Subject['id'] })[];
  } & { courseId: string };
  '/api/info': types.Info;
  '/api/group': types.Group & { courseId: types.Course['id']; planId: types.Plan['id'] };
  '/api/scheduler': types.Timetable & { sectionId: types.Section['id'] };
  '/api/exam': types.Exam & {
    roomId: types.Room['id'] | null;
    section: { id: types.Section['id'] }[];
    instructor: { id: types.Instructor['id'] }[];
  };
  '/api/scheduler-exam': types.TimetableExam & { examId: types.Exam['id'] };
  '/api/request-section/status': Record<string, unknown>;
  '/api/request-section/check': Record<string, unknown>;
  '/api/request-section': Record<string, unknown>;
};

type UniqueRouteBody = {
  '/api/publish': {
    post: { publish: boolean };
    put: Record<string, unknown>;
    delete: Record<string, unknown>;
  };
  '/api/publish-exam': {
    post: { publish: boolean };
    put: Record<string, unknown>;
    delete: Record<string, unknown>;
  };
  '/api/user': {
    post: types.User & { password: string };
    put: Partial<types.User> & { role?: 'admin' | 'user'; password?: string };
    delete: { id: string };
  };
  '/api/section': {
    post: types.SectionNew;
    put: types.SectionEdit;
    delete: { id: string };
  };
};

/**
 * Remap all route and its body data type into route data.
 */
type RouteData = {
  [R in keyof RouteBody]: {
    post: RouteBody[R];
    put: RouteBody[R];
    delete: RouteBody[R];
  };
} & UniqueRouteBody;

function apiRequest<TRoute extends keyof RouteData>(resource: TRoute, fetcher = window.fetch) {
  const url = (env.PUBLIC_API_HOST ? env.PUBLIC_API_HOST : window.location.origin) + resource;

  return {
    get: async <R = unknown>(
      query?: string | Record<string, string> | URLSearchParams,
    ): Promise<R> => {
      const session = await refresh(fetcher);
      const params =
        query instanceof URLSearchParams ? query.toString() : new URLSearchParams(query).toString();

      return (
        await fetcher(url + (params ? `?${params}` : ''), {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${session?.token.access}`,
          },
        })
      ).json();
    },
    post: async <R = unknown>(data: Omit<RouteData[TRoute]['post'], 'id'>): Promise<R> => {
      const session = await refresh(fetcher);
      return (
        await fetcher(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${session?.token.access}`,
          },
          body: JSON.stringify(data),
        })
      ).json();
    },
    put: async <R = unknown>(data: RouteData[TRoute]['put']): Promise<R> => {
      const session = await refresh(fetcher);
      return (
        await fetcher(`${url}/${data.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${session?.token.access}`,
          },
          body: JSON.stringify({ ...data, id: undefined }),
        })
      ).json();
    },
    delete: async <R = unknown>(data: Pick<RouteData[TRoute]['delete'], 'id'>): Promise<R> => {
      const session = await refresh();
      return (
        await fetcher(`${url}/${data.id}`, {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${session?.token.access}`,
          },
        })
      ).json();
    },
  };
}

function getWebsocketURL() {
  const url = new URL(env.PUBLIC_API_HOST ? env.PUBLIC_API_HOST : window.location.origin);
  url.protocol = 'ws:';
  url.pathname = '/websocket';
  return url.href;
}

export { apiRequest as default, getWebsocketURL };
