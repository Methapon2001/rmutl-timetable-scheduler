import type { ZodError } from 'zod';

export function getZodErrorMessage(
  error: ZodError | null,
  path: (string | number)[],
  exact = true,
) {
  const errMsg = error?.issues
    .filter((issue) =>
      exact
        ? issue.path.toString() == path.toString()
        : issue.path.toString().includes(path.toString()),
    )
    .map((issue) => issue.message);

  return errMsg && errMsg.length > 0 ? errMsg : null;
}
