<script lang="ts">
  import type { ZodError } from 'zod';
  import type { PageData } from './$types';

  import { invalidateAll } from '$app/navigation';
  import { blurOnEscape } from '$lib/element';
  import { userSchema } from '$lib/types';
  import { getZodErrorMessage } from '$lib/utils/zod';
  import apiRequest from '$lib/api';

  import toast from 'svelte-french-toast';

  let validateError: ZodError | null = null;

  $: err = {
    id: getZodErrorMessage(validateError, ['id']),
    password: getZodErrorMessage(validateError, ['password']),
    confirmPassword: getZodErrorMessage(validateError, ['confirmPassword']),
  };

  export let data: PageData;

  let editPassword = false;
  let password = '';
  let confirmPassword = '';

  async function handleSubmit() {
    validateError = null;

    if (!data.session) return;

    const parsed = userSchema
      .omit({
        username: true,
        role: true,
      })
      .superRefine(({ confirmPassword, password }, ctx) => {
        if (confirmPassword !== password) {
          ctx.addIssue({
            code: 'custom',
            message: 'The passwords not match.',
            path: ['confirmPassword'],
          });
        }
      })
      .safeParse({ id: data.session.user.id, password, confirmPassword });

    if (!parsed.success) return handleError(parsed.error);

    const ret = await apiRequest('/api/user')
      .put(parsed.data)
      .catch((e) => console.error(e));

    if (ret) await postSubmit();
  }

  function handleError(error: ZodError) {
    validateError = error;
  }

  async function postSubmit() {
    await invalidateAll();
    toast.success('Success');
    editPassword = false;
    password = confirmPassword = '';
  }
</script>

<div class="flex flex-col items-center">
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

    <section class="grid grid-cols-6">
      <div class="col-span-2 flex items-center">
        <span class="font-semibold">Username</span>
      </div>
      <div class="col-span-4">
        <span class="font-semibold">{data.session?.user.username}</span>
      </div>
    </section>
    <section id="form-input-password" class="grid grid-cols-6">
      <div class="col-span-2 flex items-center">
        <label for="input-password" class="font-semibold"> Password </label>
      </div>
      <div class="col-span-4">
        {#if !editPassword}
          <div class="flex justify-between">
            <span class="font-semibold">********</span>
            <button
              class="action-button text-blue-600 underline"
              on:click="{() => (editPassword = true)}"
            >
              Edit
            </button>
          </div>
        {:else}
          <input
            id="input-password"
            type="password"
            class="input"
            class:border-red-600="{err.password}"
            bind:value="{password}"
            use:blurOnEscape
          />
        {/if}
      </div>
      {#if err.password}
        <div class="col-span-4 col-start-3 text-red-600">{err.password.join()}</div>
      {/if}
    </section>

    {#if editPassword}
      <section id="form-input-confirm-password" class="grid grid-cols-6">
        <div class="col-span-2 flex items-center">
          <label for="input-confirm-password" class="font-semibold"> Confirm Password </label>
        </div>
        <div class="col-span-4">
          <input
            id="input-confirm-password"
            type="password"
            class="input"
            class:border-red-600="{err.confirmPassword}"
            bind:value="{confirmPassword}"
            use:blurOnEscape
          />
        </div>
        {#if err.confirmPassword}
          <div class="col-span-4 col-start-3 text-red-600">{err.confirmPassword.join()}</div>
        {/if}
      </section>
      <button class="button w-full" type="submit">Save</button>
    {/if}
  </form>
</div>
