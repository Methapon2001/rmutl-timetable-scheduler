<script lang="ts">
  import { goto, invalidateAll } from '$app/navigation';
  import { page } from '$app/stores';
  import { login } from '$lib/api/auth';
  import { blurOnEscape } from '$lib/element';
  import { getZodErrorMessage } from '$lib/utils/zod';
  import { ZodError, z } from 'zod';

  let schema = z.object({
    username: z.string().nonempty(),
    password: z.string().nonempty(),
  });

  let validateError: ZodError | null = null;

  $: err = {
    username: getZodErrorMessage(validateError, ['username']),
    password: getZodErrorMessage(validateError, ['password']),
    loginError: '',
  };

  let username = '';
  let password = '';

  async function handleSubmit() {
    validateError = null;
    err.loginError = '';

    const result = schema.safeParse({ username, password });

    if (!result.success) {
      validateError = result.error;
      return;
    }

    let ret = await login(result.data).catch(async (r: Response) => console.error(r));

    if (ret) {
      await invalidateAll();
      await goto($page.url.searchParams.get('redirect') ?? '/');
      return;
    }

    err.loginError = 'Incorrect username or password.';
  }
</script>

<article class="mx-auto max-w-screen-md p-4">
  <form on:submit|preventDefault="{() => handleSubmit()}" class="space-y-4">
    <section id="input-name" class="grid grid-cols-6">
      <div class="col-span-2 flex items-center">
        <label for="" class="font-semibold"> Username </label>
      </div>
      <div class="col-span-4">
        <input
          type="text"
          class="input"
          class:border-red-600="{err.username}"
          bind:value="{username}"
          use:blurOnEscape
        />
      </div>
      {#if err.username}
        <div class="col-span-4 col-start-3 text-red-600">{err.username.join()}</div>
      {/if}
    </section>

    <section id="input-name" class="grid grid-cols-6">
      <div class="col-span-2 flex items-center">
        <label for="" class="font-semibold"> Password </label>
      </div>
      <div class="col-span-4">
        <input
          type="password"
          class="input"
          class:border-red-600="{err.password}"
          bind:value="{password}"
          use:blurOnEscape
        />
      </div>
      {#if err.password}
        <div class="col-span-4 col-start-3 text-red-600">{err.password.join()}</div>
      {/if}
    </section>

    <button type="submit" class="button w-full">Submit</button>

    {#if err.password}
      <span class="text-red-600">
        {err.loginError}
      </span>
    {/if}
  </form>
</article>
