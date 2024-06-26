import { Prisma } from "@prisma/client";

export const userSelect = {
  id: true,
  username: true,
  role: true,
} satisfies Prisma.UserSelect;

export const logUserInfoSelect = {
  createdAt: true,
  updatedAt: true,
} as const;

export const logInfoSelect = {
  createdAt: true,
  createdBy: {
    select: userSelect,
  },
  updatedAt: true,
  updatedBy: {
    select: userSelect,
  },
} as const;

export const instructorSelect = {
  id: true,
  name: true,
} satisfies Prisma.InstructorSelect;

export const subjectSelect = {
  id: true,
  code: true,
  name: true,
  credit: true,
  lecture: true,
  lab: true,
  learn: true,
} satisfies Prisma.SubjectSelect;

export const buildingSelect = {
  id: true,
  code: true,
  name: true,
} satisfies Prisma.BuildingSelect;

export const roomSelect = {
  id: true,
  name: true,
  type: true,
} satisfies Prisma.RoomSelect;

export const courseDetailSelect = {
  id: true,
  type: true,
} satisfies Prisma.CourseDetailSelect;

export const courseSelect = {
  id: true,
  name: true,
} satisfies Prisma.CourseSelect;

export const planDetailSelect = {
  id: true,
  semester: true,
  year: true,
} satisfies Prisma.PlanDetailSelect;

export const planSelect = {
  id: true,
  name: true,
} satisfies Prisma.PlanSelect;

export const groupSelect = {
  id: true,
  name: true,
} satisfies Prisma.GroupSelect;

export const sectionSelect = {
  id: true,
  no: true,
  alt: true,
  lab: true,
  type: true,
  capacity: true,
} satisfies Prisma.SectionSelect;

export const infoSelect = {
  id: true,
  year: true,
  semester: true,
  current: true,
} satisfies Prisma.InfoSelect;

export const scheduleSelect = {
  id: true,
  weekday: true,
  start: true,
  end: true,
  publish: true,
} satisfies Prisma.SchedulerSelect;

export const examSelect = {
  id: true,
} satisfies Prisma.ExamSelect;

export const scheduleExamSelect = {
  id: true,
  weekday: true,
  start: true,
  end: true,
  publish: true,
} satisfies Prisma.SchedulerExamSelect;
