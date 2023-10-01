<script lang="ts">
  import type { ZodError } from 'zod';
  import toast from 'svelte-french-toast';

  import { userSchema } from '$lib/types';
  import { invalidate } from '$app/navigation';
  import { blurOnEscape } from '$lib/element';
  import { getZodErrorMessage } from '$lib/utils/zod';
  import apiRequest from '$lib/api';

  import Select from '$lib/components/Select.svelte';

  let firstInput: HTMLInputElement | null = null;
  let validateError: ZodError | null = null;

  $: err = {
    id: getZodErrorMessage(validateError, ['id']),
    username: getZodErrorMessage(validateError, ['username']),
    role: getZodErrorMessage(validateError, ['role']),
    password: getZodErrorMessage(validateError, ['password']),
    confirmPassword: getZodErrorMessage(validateError, ['confirmPassword']),
  };

  const roleOptions: { label: string; value: string }[] = [
    { label: 'User', value: 'user' },
    { label: 'Admin', value: 'admin' },
  ];

  export let edit = false;

  export let id = '';
  export let username = '';
  export let role = '';
  export let password = '';
  export let confirmPassword = '';

  function resetState() {
    id = username = role = password = confirmPassword = '';
  }

  export let callback: (data: unknown) => void = () => {
    // do nothing
  };

  async function handleEdit() {
    validateError = null;

    const parsed = userSchema
      .superRefine(({ confirmPassword, password }, ctx) => {
        if (confirmPassword !== password) {
          ctx.addIssue({
            code: 'custom',
            message: 'The passwords not match.',
            path: ['confirmPassword'],
          });
        }
      })
      .safeParse({ id, username, role, password, confirmPassword });

    if (!parsed.success) return handleError(parsed.error);

    const ret = await apiRequest('/api/user')
      .put(parsed.data)
      .catch((e) => console.error(e));

    if (ret) await postSubmit(ret);
  }
  async function handleNew() {
    validateError = null;

    const parsed = userSchema
      .omit({ id: true })
      .superRefine(({ confirmPassword, password }, ctx) => {
        if (confirmPassword !== password) {
          ctx.addIssue({
            code: 'custom',
            message: 'The passwords not match.',
            path: ['confirmPassword'],
          });
        }
      })
      .safeParse({ id, username, role, password, confirmPassword });

    if (!parsed.success) return handleError(parsed.error);

    const ret = await apiRequest('/api/user')
      .post(parsed.data)
      .catch((e) => console.error(e));

    if (ret) await postSubmit(ret);
  }

  function handleError(error: ZodError) {
    validateError = error;
  }

  async function postSubmit(data: unknown) {
    firstInput?.focus();
    await invalidate('data:user');
    toast.success('Success');
    resetState();
    callback(data);
  }
</script>

<form on:submit|preventDefault="{() => (edit ? handleEdit() : handleNew())}" class="space-y-4">
  <section id="form-input-role" class="grid grid-cols-6">
    <div class="col-span-2 flex items-center">
      <label for="input-role" class="font-semibold">
        Role <span class="text-red-600">*</span>
      </label>
    </div>
    <div class="col-span-4" class:invalid="{err.role}">
      <Select
        id="input-role"
        options="{roleOptions}"
        bind:value="{role}"
        placeholder="Select Role"
      />
    </div>
    {#if err.role}
      <div class="col-span-4 col-start-3 text-red-600">{err.role.join()}</div>
    {/if}
  </section>
  <section id="form-input-username" class="grid grid-cols-6">
    <div class="col-span-2 flex items-center">
      <label for="input-username" class="font-semibold">
        Username <span class="text-red-600">*</span>
      </label>
    </div>
    <div class="col-span-4">
      <input
        id="input-username"
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

  <section id="form-input-password" class="grid grid-cols-6">
    <div class="col-span-2 flex items-center">
      <label for="input-password" class="font-semibold">
        Password {#if !edit}<span class="text-red-600">*</span>{/if}
      </label>
    </div>
    <div class="col-span-4">
      <input
        id="input-password"
        type="password"
        class="input"
        class:border-red-600="{err.username}"
        bind:value="{password}"
        use:blurOnEscape
      />
    </div>
    {#if err.password}
      <div class="col-span-4 col-start-3 text-red-600">{err.password.join()}</div>
    {/if}
  </section>

  <section id="form-input-confirm-password" class="grid grid-cols-6">
    <div class="col-span-2 flex items-center">
      <label for="input-confirm-password" class="font-semibold">
        Confirm Password {#if !edit}<span class="text-red-600">*</span>{/if}
      </label>
    </div>
    <div class="col-span-4">
      <input
        id="input-confirm-password"
        type="password"
        class="input"
        class:border-red-600="{err.username}"
        bind:value="{confirmPassword}"
        use:blurOnEscape
      />
    </div>
    {#if err.confirmPassword}
      <div class="col-span-4 col-start-3 text-red-600">{err.confirmPassword.join()}</div>
    {/if}
  </section>

  <button type="submit" class="button w-full">Save</button>
</form>
