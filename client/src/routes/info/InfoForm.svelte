<script lang="ts">
  import type { ZodError } from 'zod';
  import toast from 'svelte-french-toast';

  import { infoSchema } from '$lib/types';
  import { invalidate } from '$app/navigation';
  import { blurOnEscape } from '$lib/element';
  import { getZodErrorMessage } from '$lib/utils/zod';
  import apiRequest from '$lib/api';

  let firstInput: HTMLInputElement | null = null;
  let validateError: ZodError | null = null;

  $: err = {
    id: getZodErrorMessage(validateError, ['id']),
    semester: getZodErrorMessage(validateError, ['semester']),
    year: getZodErrorMessage(validateError, ['year']),
  };

  export let edit = false;

  export let id = '';
  export let semester = 1;
  export let year = new Date().getFullYear() + 543;
  export let current = true;

  function resetState() {
    id = '';
    semester = 1;
    year = new Date().getFullYear() + 543;
    current = true;
  }

  export let callback: (data: unknown) => void = () => {
    // do nothing
  };

  async function handleEdit() {
    validateError = null;

    const parsed = infoSchema.safeParse({ id, semester, year });

    if (!parsed.success) return handleError(parsed.error);

    const ret = await apiRequest('/api/info')
      .put(parsed.data)
      .catch((e) => console.error(e));

    if (ret) await postSubmit(ret);
  }

  async function handleNew() {
    validateError = null;

    const parsed = infoSchema.omit({ id: true }).safeParse({ semester, year, current: true });

    if (!parsed.success) return handleError(parsed.error);

    const ret = await apiRequest('/api/info')
      .post(parsed.data)
      .catch((e) => console.error(e));

    if (ret) await postSubmit(ret);
  }

  function handleError(error: ZodError) {
    validateError = error;
  }

  async function postSubmit(data: unknown) {
    firstInput?.focus();
    await invalidate('data:info');
    toast.success('Success');
    resetState();
    callback(data);
  }
</script>

<form on:submit|preventDefault="{() => (edit ? handleEdit() : handleNew())}" class="space-y-4">
  <section id="input-semester" class="grid grid-cols-6 items-center">
    <div class="col-span-2">
      <label for="form-info-semester" class="font-semibold">
        Semester <span class="text-red-600">*</span>
      </label>
    </div>
    <div class="col-span-4">
      <input
        id="form-info-semester"
        type="number"
        placeholder="Semester"
        class="input w-fit text-center"
        class:border-red-600="{err.semester}"
        bind:value="{semester}"
        bind:this="{firstInput}"
        use:blurOnEscape
      />
    </div>
    {#if err.semester}
      <div class="col-span-4 col-start-3 text-red-600">{err.semester.join()}</div>
    {/if}
  </section>
  <section id="input-year" class="grid grid-cols-6 items-center">
    <div class="col-span-2">
      <label for="form-info-year" class="font-semibold">
        Year <span class="text-red-600">*</span>
      </label>
    </div>
    <div class="col-span-4">
      <input
        id="form-info-year"
        type="number"
        placeholder="Year"
        class="input w-fit text-center"
        class:border-red-600="{err.year}"
        bind:value="{year}"
        use:blurOnEscape
      />
    </div>
    {#if err.year}
      <div class="col-span-4 col-start-3 text-red-600">{err.year.join()}</div>
    {/if}
  </section>
  <button type="submit" class="button w-full">Save</button>
</form>
