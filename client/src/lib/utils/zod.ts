import type { ZodError } from 'zod';

export function getZodErrorMessage(error: ZodError, path: (string | number)[]) {
  return error.issues
    .filter((issue) => issue.path.toString() == path.toString())
    .map((issue) => issue.message);
}
