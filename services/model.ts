export const userSelect = {
  id: true,
  username: true,
  role: true,
};

export const logUserInfoSelect = {
  createdAt: true,
  updatedAt: true,
};

export const logInfoSelect = {
  createdAt: true,
  createdBy: {
    select: userSelect,
  },
  updatedAt: true,
  updatedBy: {
    select: userSelect,
  },
};

export const instructorSelect = {
  id: true,
  name: true,
};

export const subjectSelect = {
  id: true,
  code: true,
  name: true,
  credit: true,
  lecture: true,
  lab: true,
  learn: true,
};

export const buildingSelect = {
  id: true,
  code: true,
  name: true,
};

export const roomSelect = {
  id: true,
  name: true,
  type: true,
};

export const courseDetailSelect = {
  id: true,
  type: true,
};

export const courseSelect = {
  id: true,
  name: true,
};

export const planDetailSelect = {
  id: true,
  semester: true,
  year: true,
};

export const planSelect = {
  id: true,
  name: true,
};

export const groupSelect = {
  id: true,
  name: true,
};

export const sectionSelect = {
  id: true,
  no: true,
  alt: true,
  lab: true,
  type: true,
  capacity: true,
};

export const infoSelect = {
  id: true,
  year: true,
  semester: true,
  current: true,
};

export const scheduleSelect = {
  id: true,
  weekday: true,
  start: true,
  end: true,
  publish: true,
};

export const examSelect = {
  id: true,
};

export const scheduleExamSelect = {
  id: true,
  weekday: true,
  start: true,
  end: true,
  publish: true,
};
