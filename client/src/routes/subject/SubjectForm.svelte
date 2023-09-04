<script lang="ts">
  import type { ZodError } from 'zod';
  import toast from 'svelte-french-toast';

  import { subjectSchema } from '$lib/types';
  import { invalidate } from '$app/navigation';
  import { blurOnEscape } from '$lib/utils/directives';
  import { getZodErrorMessage } from '$lib/utils/zod';
  import apiRequest from '$lib/api';

  let firstInput: HTMLInputElement | null = null;
  let validateError: ZodError | null = null;

  $: err = {
    id: getZodErrorMessage(validateError, ['id']),
    code: getZodErrorMessage(validateError, ['code']),
    name: getZodErrorMessage(validateError, ['name']),
    credit: getZodErrorMessage(validateError, ['credit']),
    lecture: getZodErrorMessage(validateError, ['lecture']),
    lab: getZodErrorMessage(validateError, ['lab']),
    learn: getZodErrorMessage(validateError, ['learn']),
  };

  export let edit = false;

  export let id = '';
  export let code = '';
  export let name = '';
  export let credit = 0;
  export let lecture = 0;
  export let lab = 0;
  export let learn = 0;

  function resetState() {
    id = code = name = '';
    credit = lecture = lab = 0;
  }

  export let callback: (data: unknown) => void = () => {
    // do nothing.
  };

  async function handleEdit() {
    validateError = null;

    const parsed = subjectSchema.safeParse({ id, code, name, credit, lecture, lab, learn });

    if (!parsed.success) return handleError(parsed.error);

    const ret = await apiRequest('/api/subject')
      .put(parsed.data)
      .catch((e) => console.error(e));

    if (ret) await postSubmit(ret);
  }

  async function handleNew() {
    validateError = null;

    const parsed = subjectSchema
      .omit({ id: true })
      .safeParse({ id, code, name, credit, lecture, lab, learn });

    if (!parsed.success) return handleError(parsed.error);

    const ret = await apiRequest('/api/subject')
      .post(parsed.data)
      .catch((e) => console.error(e));

    if (ret) await postSubmit(ret);
  }

  function handleError(error: ZodError) {
    validateError = error;
  }

  async function postSubmit(data: unknown) {
    firstInput?.focus();
    await invalidate('data:subject');
    toast.success('Success');
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
        placeholder="Subject Code"
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
        placeholder="Subject Name"
        class="input"
        class:border-red-600="{err.name}"
        bind:value="{name}"
        use:blurOnEscape
      />
    </div>
    {#if err.name} <div class="col-span-4 col-start-3 text-red-600">{err.name.join()}</div> {/if}
  </section>

  <section id="input-credit" class="grid grid-cols-6">
    <div class="col-span-2 flex items-center">
      <label for="form-input-credit" class="font-semibold">
        Credit <span class="text-red-600">*</span>
      </label>
    </div>
    <div class="col-span-4">
      <input
        id="form-input-credit"
        type="number"
        class="input w-fit text-center"
        class:border-red-600="{err.credit}"
        bind:value="{credit}"
        use:blurOnEscape
      />
    </div>
    {#if err.credit}
      <div class="col-span-4 col-start-3 text-red-600">{err.credit.join()}</div>
    {/if}
  </section>

  <section id="input-lecture" class="grid grid-cols-6">
    <div class="col-span-2 flex items-center">
      <label for="form-input-lecture" class="font-semibold">
        Lecture <span class="text-red-600">*</span>
      </label>
    </div>
    <div class="col-span-4">
      <input
        id="form-input-lecture"
        type="number"
        class="input w-fit text-center"
        class:border-red-600="{err.lecture}"
        bind:value="{lecture}"
        use:blurOnEscape
      />
    </div>
    {#if err.lecture}
      <div class="col-span-4 col-start-3 text-red-600">{err.lecture.join()}</div>
    {/if}
  </section>

  <section id="input-lab" class="grid grid-cols-6">
    <div class="col-span-2 flex items-center">
      <label for="form-input-lab" class="font-semibold">
        Lab <span class="text-red-600">*</span>
      </label>
    </div>
    <div class="col-span-4">
      <input
        id="form-input-lab"
        type="number"
        class="input w-fit text-center"
        class:border-red-600="{err.lecture}"
        bind:value="{lab}"
        use:blurOnEscape
      />
    </div>
    {#if err.lab}
      <div class="col-span-4 col-start-3 text-red-600">{err.lab.join()}</div>
    {/if}
  </section>

  <section id="input-learn" class="grid grid-cols-6">
    <div class="col-span-2 flex items-center">
      <label for="form-input-learn" class="font-semibold">
        Learn <span class="text-red-600">*</span>
      </label>
    </div>
    <div class="col-span-4">
      <input
        id="form-input-learn"
        type="number"
        class="input w-fit text-center"
        class:border-red-600="{err.learn}"
        bind:value="{learn}"
        use:blurOnEscape
      />
    </div>
    {#if err.lab}
      <div class="col-span-4 col-start-3 text-red-600">{err.lab.join()}</div>
    {/if}
  </section>

  <button type="submit" class="button w-full">Save</button>
</form>
