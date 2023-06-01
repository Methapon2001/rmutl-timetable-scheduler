<script lang="ts">
  import type { PageData } from './$types';
  import { invalidateAll } from '$app/navigation';
  import { editUser } from '$lib/api/user';
  import { blurOnEscape } from '$lib/utils/directives';
  import { getZodErrorMessage } from '$lib/utils/zod';
  import { ZodError, z } from 'zod';

  let editPassword = false;

  export let data: PageData;

  let schema = z
    .object({
      password: z.string().nonempty(),
      confirmPassword: z.string().nonempty(),
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

  let form: {
    data: z.infer<typeof schema>;
    error: ZodError | undefined;
  } = {
    data: {
      password: '',
      confirmPassword: '',
    },
    error: undefined,
  };

  async function handleSubmit() {
    form.error = undefined;

    const result = schema
      .superRefine((val, ctx) => {
        if (val.password && val.password.length < 4) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'Password must be longer than 4 characters.',
            path: ['password'],
          });
        }
      })
      .transform((val) => ({ ...val, password: val.password == '' ? undefined : val.password }))
      .safeParse(form.data);

    if (!result.success) {
      form.error = result.error;
      return;
    }

    if (data.session?.user.id) {
      const ret = await editUser({ id: data.session.user.id, ...result.data }).catch(
        (r: Response) => console.error(r),
      );

      if (ret) {
        form.data = {
          password: '',
          confirmPassword: '',
        };

        await invalidateAll();
      }
    }
  }
</script>

<div class="flex justify-center">
  <div>
    <h1 class="my-4 text-center text-3xl font-bold">Profile</h1>
    <form
      on:submit|preventDefault="{() => handleSubmit()}"
      class="w-screen max-w-screen-sm space-y-4 rounded border p-4"
    >
      <section id="role" class="grid grid-cols-6">
        <div class="col-span-2 flex items-center">
          <label for="" class="font-semibold"> Role </label>
        </div>
        <div class="col-span-4">
          <span class="font-semibold capitalize">{data.session?.user.role}</span>
        </div>
      </section>

      <section id="input-username" class="grid grid-cols-6">
        <div class="col-span-2 flex items-center">
          <label for="" class="font-semibold"> Username </label>
        </div>
        <div class="col-span-4">
          <span class="font-semibold">{data.session?.user.username}</span>
        </div>
        <div class="col-span-4 col-start-3 text-red-600">
          {form.error ? getZodErrorMessage(form.error, ['username']) : ''}
        </div>
      </section>

      <section id="input-password" class="grid grid-cols-6">
        <div class="col-span-2 flex items-center">
          <label for="" class="font-semibold"> Password </label>
        </div>
        <div class="col-span-4">
          {#if !editPassword}
            <div class="flex justify-between">
              <span class="font-semibold">*****</span>
              <button
                class="action-button text-blue-600 underline"
                on:click="{() => {
                  editPassword = true;
                }}"
              >
                Edit
              </button>
            </div>
          {:else}
            <input
              type="password"
              class="input
                    {form.error && getZodErrorMessage(form.error, ['password']).length > 0
                ? 'border border-red-600'
                : ''}"
              bind:value="{form.data.password}"
              use:blurOnEscape
            />
          {/if}
        </div>
        <div class="col-span-4 col-start-3 text-red-600">
          {form.error ? getZodErrorMessage(form.error, ['password']) : ''}
        </div>
      </section>

      {#if editPassword}
        <section id="input-confirm-password" class="grid grid-cols-6">
          <div class="col-span-2 flex items-center">
            <label for="" class="font-semibold"> Confirm Password </label>
          </div>
          <div class="col-span-4">
            <input
              type="password"
              class="input
                    {form.error && getZodErrorMessage(form.error, ['cnofirmPassword']).length > 0
                ? 'border border-red-600'
                : ''}"
              bind:value="{form.data.confirmPassword}"
              use:blurOnEscape
            />
          </div>
          <div class="col-span-4 col-start-3 text-red-600">
            {form.error ? getZodErrorMessage(form.error, ['cnofirmPassword']) : ''}
          </div>
        </section>
        <button class="button w-full" type="submit"> Save </button>
      {/if}
    </form>
  </div>
</div>
