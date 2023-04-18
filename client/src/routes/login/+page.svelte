<script lang="ts">
  import { goto, invalidateAll } from '$app/navigation';
  import { login } from '$lib/api/auth';
  import { blurOnEscape } from '$lib/utils/directives';
  import { getZodErrorMessage } from '$lib/utils/zod';
  import { ZodError, z } from 'zod';

  let schema = z.object({
    username: z.string().nonempty(),
    password: z.string().nonempty(),
  });

  let form: {
    data: z.infer<typeof schema>;
    error: ZodError | undefined;
  } = {
    data: {
      username: '',
      password: '',
    },
    error: undefined,
  };

  let loginError = '';

  async function handleSubmit() {
    form.error = undefined;
    loginError = '';

    const result = schema.safeParse(form.data);

    if (!result.success) {
      form.error = result.error;
      return;
    }

    let ret = await login(result.data).catch(async (r: Response) => console.error(r));

    if (ret) {
      await invalidateAll();
      goto('/');
      return;
    }

    loginError = 'Incorrect username or password.';
  }
</script>

<article class="mx-auto max-w-screen-md p-4">
  <form on:submit|preventDefault={() => handleSubmit()} class="space-y-4">
    <section id="input-name" class="grid grid-cols-6">
      <div class="col-span-2 flex items-center">
        <label for="" class="font-semibold"> Username </label>
      </div>
      <div class="col-span-4">
        <input
          type="text"
          class="input text-center
        {form.error && getZodErrorMessage(form.error, ['username']).length > 0
            ? 'border border-red-600'
            : ''}"
          bind:value={form.data.username}
          use:blurOnEscape
        />
      </div>
      <div class="col-span-4 col-start-3 text-red-600">
        {form.error ? getZodErrorMessage(form.error, ['username']) : ''}
      </div>
    </section>

    <section id="input-name" class="grid grid-cols-6">
      <div class="col-span-2 flex items-center">
        <label for="" class="font-semibold"> Password </label>
      </div>
      <div class="col-span-4">
        <input
          type="password"
          class="input text-center
        {form.error && getZodErrorMessage(form.error, ['password']).length > 0
            ? 'border border-red-600'
            : ''}"
          bind:value={form.data.password}
          use:blurOnEscape
        />
      </div>
      <div class="col-span-4 col-start-3 text-red-600">
        {form.error ? getZodErrorMessage(form.error, ['password']) : ''}
      </div>
    </section>

    <button type="submit" class="button w-full">Submit</button>
    <span class="text-red-600">
      {loginError}
    </span>
  </form>
</article>
