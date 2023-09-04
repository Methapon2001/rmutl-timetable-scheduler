<script lang="ts">
  import type { ZodError } from 'zod';
  import type { CourseDetail, ResponseDataInfo, LogInfo, Subject } from '$lib/types';
  import toast from 'svelte-french-toast';

  import { courseSchema } from '$lib/types';
  import { invalidate } from '$app/navigation';
  import { blurOnEscape } from '$lib/utils/directives';
  import { getZodErrorMessage } from '$lib/utils/zod';
  import apiRequest from '$lib/api';

  import Select from '$lib/components/Select.svelte';

  let firstInput: HTMLInputElement | null = null;
  let validateError: ZodError | null = null;

  $: err = {
    id: getZodErrorMessage(validateError, ['id']),
    name: getZodErrorMessage(validateError, ['name']),
    detail: getZodErrorMessage(validateError, ['detail'], false),
  };

  export let edit = false;

  export let id = '';
  export let name = '';
  export let detail: (Omit<CourseDetail, 'id'> & { subjectId: string })[] = [];

  /**
   * Necessary for edit mode
   */
  let compulsory: string[] = detail.filter((v) => v.type === 'compulsory').map((v) => v.subjectId);
  let elective: string[] = detail.filter((v) => v.type === 'elective').map((v) => v.subjectId);

  $: detail = [
    ...compulsory.map((v) => ({ type: 'compulsory' as const, subjectId: v })),
    ...elective.map((v) => ({ type: 'elective' as const, subjectId: v })),
  ];

  const subject = apiRequest('/api/subject').get<ResponseDataInfo<LogInfo<Subject>>>({
    limit: '9999',
  });

  const subjectOptions = async () =>
    (await subject).data
      .sort((a, b) => a.name.localeCompare(b.name) || a.code.localeCompare(b.code))
      .map((v) => ({ label: `${v.code} ${v.name}`, value: v.id }));

  function resetState() {
    id = name = '';
    compulsory = elective = [];
  }

  export let callback: (data: unknown) => void = () => {
    // do nothing
  };

  async function handleEdit() {
    validateError = null;

    const parsed = courseSchema.safeParse({ id, name, detail });

    if (!parsed.success) return handleError(parsed.error);

    const ret = await apiRequest('/api/course')
      .put(parsed.data)
      .catch((e) => console.error(e));

    if (ret) await postSubmit(ret);
  }

  async function handleNew() {
    validateError = null;

    const parsed = courseSchema.omit({ id: true }).safeParse({ id, name, detail });

    if (!parsed.success) return handleError(parsed.error);

    const ret = await apiRequest('/api/course')
      .post(parsed.data)
      .catch((e) => console.error(e));

    if (ret) await postSubmit(ret);
  }

  function handleError(error: ZodError) {
    validateError = error;
    console.error(error);
  }

  async function postSubmit(data: unknown) {
    firstInput?.focus();
    await invalidate('data:course');
    toast.success('Success');
    resetState();
    callback(data);
  }
</script>

<form on:submit|preventDefault="{() => (edit ? handleEdit() : handleNew())}" class="space-y-4">
  <section id="input-name" class="grid grid-cols-6">
    <div class="col-span-2 flex items-center">
      <label for="form-course-name" class="font-semibold">
        Name <span class="text-red-600">*</span>
      </label>
    </div>
    <div class="col-span-4">
      <input
        id="form-course-name"
        type="text"
        placeholder="Course Name"
        class="input"
        class:border-red-600="{err.name}"
        bind:value="{name}"
        bind:this="{firstInput}"
        use:blurOnEscape
      />
    </div>
    {#if err.name} <div class="col-span-4 col-start-3 text-red-600">{err.name.join()}</div> {/if}
  </section>
  <section id="input-compulsory" class="grid grid-cols-6">
    <div class="col-span-2 flex items-center">
      <label for="form-course-detail-compulsory" class="font-semibold">Compulsory</label>
    </div>
    <div class="col-span-4" class:invalid="{err.detail}">
      {#await subjectOptions()}
        <Select options="{[]}" placeholder="Loading..." />
      {:then options}
        {@const filtered = options.filter((v) => !elective.includes(v.value))}
        <Select
          id="form-room-building"
          options="{filtered}"
          bind:value="{compulsory}"
          placeholder="Select Compulsory Subject"
          multiple
        />
      {/await}
    </div>

    {#if err.detail}
      <div class="col-span-4 col-start-3 text-red-600">{err.detail.join()}</div>
    {/if}
  </section>
  <section id="input-elective" class="grid grid-cols-6">
    <div class="col-span-2 flex items-center">
      <label for="form-course-detail-elective" class="font-semibold">Elective</label>
    </div>
    <div class="col-span-4" class:invalid="{err.detail}">
      {#await subjectOptions()}
        <Select options="{[]}" placeholder="Loading..." />
      {:then options}
        {@const filtered = options.filter((v) => !compulsory.includes(v.value))}
        <Select
          id="form-room-building"
          options="{filtered}"
          bind:value="{elective}"
          placeholder="Select Elective Subject"
          multiple
        />
      {/await}
    </div>

    {#if err.detail}
      <div class="col-span-4 col-start-3 text-red-600">{err.detail.join()}</div>
    {/if}
  </section>

  <button type="submit" class="button w-full">Save</button>
</form>
