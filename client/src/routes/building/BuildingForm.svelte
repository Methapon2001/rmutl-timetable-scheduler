<script lang="ts">
  import type { ZodError } from 'zod';
  import { invalidate } from '$app/navigation';
  import { blurOnEscape } from '$lib/utils/directives';
  import { getZodErrorMessage } from '$lib/utils/zod';
  import { buildingSchema } from '$lib/types';
  import apiRequest from '$lib/api';
  import toast from 'svelte-french-toast';

  let firstInput: HTMLInputElement | null = null;
  let validateError: ZodError | null = null;

  $: err = {
    id: getZodErrorMessage(validateError, ['id']),
    code: getZodErrorMessage(validateError, ['code']),
    name: getZodErrorMessage(validateError, ['name']),
  };

  export let edit = false;

  export let id = '';
  export let code = '';
  export let name = '';

  function resetState() {
    id = code = name = '';
  }

  export let callback: (data: unknown) => void = () => {
    // do nothing
  };

  async function handleEdit() {
    validateError = null;

    const parsed = buildingSchema.safeParse({ id, code, name });

    if (!parsed.success) return handleError(parsed.error);

    const ret = await apiRequest('/api/building')
      .put(parsed.data)
      .catch((e) => console.error(e));

    if (ret) await postSubmit(ret);
  }

  async function handleNew() {
    validateError = null;

    const parsed = buildingSchema.omit({ id: true }).safeParse({ code, name });

    if (!parsed.success) return handleError(parsed.error);

    const ret = await apiRequest('/api/building')
      .post(parsed.data)
      .catch((e) => console.error(e));

    if (ret) await postSubmit(ret);
  }

  function handleError(error: ZodError) {
    validateError = error;
  }

  async function postSubmit(data: unknown) {
    firstInput?.focus();
    toast.success('Success');
    await invalidate('data:building');
    resetState();
    callback(data);
  }
</script>

<form on:submit|preventDefault="{() => (edit ? handleEdit() : handleNew())}" class="space-y-4">
  <section id="input-code" class="grid grid-cols-6">
    <div class="col-span-2 flex items-center">
      <label for="form-input-code" class="font-semibold">
        Code <span class="text-red-600">*</span>
      </label>
    </div>
    <div class="col-span-4">
      <input
        id="form-input-code"
        type="text"
        placeholder="Building Code"
        class="input"
        class:border-red-600="{err.code}"
        bind:value="{code}"
        bind:this="{firstInput}"
        use:blurOnEscape
      />
    </div>
    {#if err.code} <div class="col-span-4 col-start-3 text-red-600">{err.code.join()}</div> {/if}
  </section>

  <section id="input-name" class="grid grid-cols-6">
    <div class="col-span-2 flex items-center">
      <label for="form-input-name" class="font-semibold">
        Name <span class="text-red-600">*</span>
      </label>
    </div>
    <div class="col-span-4">
      <input
        id="form-input-name"
        type="text"
        placeholder="Building Name"
        class="input"
        class:border-red-600="{err.name}"
        bind:value="{name}"
        use:blurOnEscape
      />
    </div>
    {#if err.name} <div class="col-span-4 col-start-3 text-red-600">{err.name.join()}</div> {/if}
  </section>

  <button type="submit" class="button w-full">Save</button>
</form>
