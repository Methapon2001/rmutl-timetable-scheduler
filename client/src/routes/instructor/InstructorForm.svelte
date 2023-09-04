<script lang="ts">
  import type { ZodError } from 'zod';
  import toast from 'svelte-french-toast';

  import { instructorSchema } from '$lib/types';
  import { invalidate } from '$app/navigation';
  import { blurOnEscape } from '$lib/utils/directives';
  import { getZodErrorMessage } from '$lib/utils/zod';
  import apiRequest from '$lib/api';

  let firstInput: HTMLInputElement | null = null;
  let validateError: ZodError | null = null;

  $: err = {
    id: getZodErrorMessage(validateError, ['id']),
    name: getZodErrorMessage(validateError, ['name']),
  };

  export let edit = false;

  export let id = '';
  export let name = '';

  function resetState() {
    id = name = '';
  }

  export let callback: (data: unknown) => void = () => {
    // do nothing
  };

  async function handleEdit() {
    validateError = null;

    const parsed = instructorSchema.safeParse({ id, name });

    if (!parsed.success) return handleError(parsed.error);

    const ret = await apiRequest('/api/instructor')
      .put(parsed.data)
      .catch((e) => console.error(e));

    if (ret) await postSubmit(ret);
  }

  async function handleNew() {
    validateError = null;

    const parsed = instructorSchema.omit({ id: true }).safeParse({ name });

    if (!parsed.success) return handleError(parsed.error);

    const ret = await apiRequest('/api/instructor')
      .post(parsed.data)
      .catch((e) => console.error(e));

    if (ret) await postSubmit(ret);
  }

  function handleError(error: ZodError) {
    validateError = error;
  }

  async function postSubmit(data: unknown) {
    firstInput?.focus();
    await invalidate('data:instructor');
    toast.success('Success');
    resetState();
    callback(data);
  }
</script>

<form on:submit|preventDefault="{() => (edit ? handleEdit() : handleNew())}" class="space-y-4">
  <section id="input-name" class="grid grid-cols-6 items-center">
    <div class="col-span-2">
      <label for="form-inst-name" class="font-semibold">
        Name <span class="text-red-600">*</span>
      </label>
    </div>
    <div class="col-span-4">
      <input
        id="form-inst-name"
        type="text"
        placeholder="Instructor Name"
        class="input"
        class:border-red-600="{err.name}"
        bind:value="{name}"
        bind:this="{firstInput}"
        use:blurOnEscape
      />
    </div>
    {#if err.name} <div class="col-span-4 col-start-3 text-red-600">{err.name.join()}</div> {/if}
  </section>

  <button type="submit" class="button w-full">Save</button>
</form>
