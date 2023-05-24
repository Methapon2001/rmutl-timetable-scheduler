declare namespace API {
  type Session = {
    token: {
      access: string;
      refresh: string;
    };
    user: {
      id: string;
      username: string;
      role: string;
      jti: string;
      iat: number;
      exp: number;
    };
  };

  type User = {
    id: string;
    username: string;
    role: string;
    createdAt: string;
    updatedAt: string;
  };

  type Subject = {
    id: string;
    code: string;
    name: string;
    credit: number;
    lecture: number;
    lab: number;
    exam: number;
    learn: number;
    createdAt: string;
    createdBy: Omit<API.User, 'createdAt' | 'updatedAt'>;
    updatedAt: string;
    updatedBy: Omit<API.User, 'createdAt' | 'updatedAt'>;
  };

  type Instructor = {
    id: string;
    name: string;
    createdAt: string;
    createdBy: Omit<API.User, 'createdAt' | 'updatedAt'>;
    updatedAt: string;
    updatedBy: Omit<API.User, 'createdAt' | 'updatedAt'>;
  };

  type Building = {
    id: string;
    code: string;
    name: string;
    createdAt: string;
    createdBy: Omit<API.User, 'createdAt' | 'updatedAt'>;
    updatedAt: string;
    updatedBy: Omit<API.User, 'createdAt' | 'updatedAt'>;
  };

  type Room = {
    id: string;
    type: string;
    name: string;
    building: Omit<API.Building, 'createdAt' | 'createdBy' | 'updatedAt' | 'updatedBy'>;
    createdAt: string;
    createdBy: Omit<API.User, 'createdAt' | 'updatedAt'>;
    updatedAt: string;
    updatedBy: Omit<API.User, 'createdAt' | 'updatedAt'>;
  };

  type Course = {
    id: string;
    name: string;
    detail: {
      subject: Omit<API.Subject, 'createdAt' | 'createdBy' | 'updatedAt' | 'updatedBy'>;
      type: string;
    }[];
    createdAt: string;
    createdBy: Omit<API.User, 'createdAt' | 'updatedAt'>;
    updatedAt: string;
    updatedBy: Omit<API.User, 'createdAt' | 'updatedAt'>;
  };

  type Group = {
    id: string;
    name: string;
    course: Omit<API.Course, 'createdAt' | 'createdBy' | 'updatedAt' | 'updatedBy'>;
    plan: Omit<API.Plan, 'course' | 'createdAt' | 'createdBy' | 'updatedAt' | 'updatedBy'>;
    createdAt: string;
    createdBy: Omit<API.User, 'createdAt' | 'updatedAt'>;
    updatedAt: string;
    updatedBy: Omit<API.User, 'createdAt' | 'updatedAt'>;
  };

  type Section = {
    id: string;
    no: number;
    alt: string;
    lab: number;
    type: string;
    group: Omit<API.Group, 'createdAt' | 'createdBy' | 'updatedAt' | 'updatedBy'> | null;
    room: Omit<API.Room, 'createdAt' | 'createdBy' | 'updatedAt' | 'updatedBy'> | null;
    subject: Omit<API.Subject, 'createdAt' | 'createdBy' | 'updatedAt' | 'updatedBy'>;
    instructor: Omit<API.Instructor, 'createdAt' | 'createdBy' | 'updatedAt' | 'updatedBy'>[];
    parent: Omit<API.Section, 'child' | 'createdAt' | 'createdBy' | 'updatedAt' | 'updatedBy'>[];
    child: Omit<API.Section, 'child' | 'createdAt' | 'createdBy' | 'updatedAt' | 'updatedBy'>[];
    createdAt: string;
    createdBy: Omit<API.User, 'createdAt' | 'updatedAt'>;
    updatedAt: string;
    updatedBy: Omit<API.User, 'createdAt' | 'updatedAt'>;
  };

  type Scheduler = {
    id: string;
    weekday: 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun';
    start: number;
    end: number;
    section: Omit<API.Section, 'createdAt' | 'createdBy' | 'updatedAt' | 'updatedBy'>;
    createdAt: string;
    createdBy: Omit<API.User, 'createdAt' | 'updatedAt'>;
    updatedAt: string;
    updatedBy: Omit<API.User, 'createdAt' | 'updatedAt'>;
  };

  type ExamSection = Omit<API.Section, 'createdAt' | 'createdBy' | 'updatedAt' | 'updatedBy'> & {
    group: {
      id: string;
      name: string;
    };
  };

  type Exam = {
    id: string;
    room: Omit<API.Room, 'createdAt' | 'createdBy' | 'updatedAt' | 'updatedBy'> | null;
    instructor: Omit<API.Instructor, 'createdAt' | 'createdBy' | 'updatedAt' | 'updatedBy'>[];
    section: API.ExamSection[];
    createdAt: string;
    createdBy: Omit<API.User, 'createdAt' | 'updatedAt'>;
    updatedAt: string;
    updatedBy: Omit<API.User, 'createdAt' | 'updatedAt'>;
  };

  type SchedulerExam = {
    id: string;
    weekday: 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun';
    start: number;
    end: number;
    exam: Omit<API.Exam, 'createdAt' | 'createdBy' | 'updatedAt' | 'updatedBy'>;
    createdAt: string;
    createdBy: Omit<API.User, 'createdAt' | 'updatedAt'>;
    updatedAt: string;
    updatedBy: Omit<API.User, 'createdAt' | 'updatedAt'>;
  };

  type Plan = {
    id: string;
    name: string;
    course: Omit<API.Course, 'createdAt' | 'createdBy' | 'updatedAt' | 'updatedBy'>;
    detail: {
      semester: number;
      year: number;
      subject: Omit<API.Subject, 'createdAt' | 'createdBy' | 'updatedAt' | 'updatedBy'>;
    }[];
    createdAt: string;
    createdBy: Omit<API.User, 'createdAt' | 'updatedAt'>;
    updatedAt: string;
    updatedBy: Omit<API.User, 'createdAt' | 'updatedAt'>;
  };
}
