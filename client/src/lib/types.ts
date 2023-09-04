import { z } from 'zod';

const ERR_SELECT_MSG = 'Must select one of the options.';

const ENUM_ERROR_MAP: z.ZodErrorMap = () => ({ message: ERR_SELECT_MSG });

export type ResponseDataInfo<T> = {
  data: T[];
  limit: number;
  offset: number;
  total: number;
};

export const userSchema = z
  .object({
    id: z.string().nonempty(),
    username: z.string().min(3),
    role: z.string().nonempty({ message: ERR_SELECT_MSG }),
    password: z.string().min(4, 'Password must be longer than 4 characters.'),
    confirmPassword: z.string().min(4, 'Password must be longer than 4 characters.'),
  })
  .superRefine(({ confirmPassword, password }, ctx) => {
    if (confirmPassword !== password) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'The passwords did not match.',
        path: ['confirmPassword'],
      });
    }
  });

export type UserInput = Omit<z.infer<typeof userSchema>, 'confirmPassword'>;
export type User = Omit<UserInput, 'password'>;

export type LogUserInfo = {
  createdAt: string;
  updatedAt: string;
};

export type LogInfo<T> = T & {
  createdAt: string;
  createdBy: User;
  updatedAt: string;
  updatedBy: User;
};

export type Session = {
  token: {
    access: string;
    refresh: string;
  };
  user: User & {
    role: string;
    jti: string;
    iat: number;
    exp: number;
  };
};

export const instructorSchema = z.object({
  id: z.string().nonempty(),
  name: z.string().min(3),
});

export type Instructor = z.infer<typeof instructorSchema>;

export const subjectSchema = z.object({
  id: z.string().nonempty(),
  code: z.string().min(1),
  name: z.string().min(3),
  credit: z.number().min(0),
  lecture: z.number().min(0),
  lab: z.number().min(0),
  learn: z.number().min(0),
});

export type Subject = z.infer<typeof subjectSchema>;

export const buildingSchema = z.object({
  id: z.string().nonempty(),
  code: z.string().min(1),
  name: z.string().min(3),
});

export type Building = z.infer<typeof buildingSchema>;

export const roomSchema = z.object({
  id: z.string().nonempty(),
  name: z.string().min(3),
  type: z.enum(['lecture', 'lab', 'both'], { errorMap: ENUM_ERROR_MAP }),
  buildingId: z.string().nonempty({ message: ERR_SELECT_MSG }),
});

export type Room = Omit<z.infer<typeof roomSchema>, 'buildingId'>;

export const courseDetailSchema = z.object({
  type: z.enum(['compulsory', 'elective'], { errorMap: ENUM_ERROR_MAP }),
  subjectId: z.string().nonempty(),
});

export const courseSchema = z.object({
  id: z.string().nonempty(),
  name: z.string().min(3),
  detail: courseDetailSchema.array(),
});

export type CourseDetail = Omit<z.infer<typeof courseDetailSchema>, 'subjectId'> & { id: string };
export type Course = Omit<z.infer<typeof courseSchema>, 'detail'>;

export const planDetailSchema = z.object({
  year: z.number().min(1).max(8),
  semester: z.number().min(1).max(3),
  subjectId: z.string().nonempty(),
});

export const planSchema = z.object({
  id: z.string().nonempty(),
  name: z.string().min(3),
  detail: planDetailSchema.array(),
  courseId: z.string().nonempty({ message: ERR_SELECT_MSG }),
});

export type PlanDetail = Omit<z.infer<typeof planDetailSchema>, 'subjectId'> & { id: string };
export type Plan = Omit<z.infer<typeof planSchema>, 'detail' | 'courseId'>;
