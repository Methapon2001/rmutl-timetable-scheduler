<script lang="ts">
  import type { ZodError } from 'zod';
  import type {
    Course,
    Plan,
    ResponseDataInfo,
    LogInfo,
    Subject,
    CourseDetail,
    PlanDetail,
  } from '$lib/types';
  import toast from 'svelte-french-toast';

  import { groupSchema } from '$lib/types';
  import { invalidate } from '$app/navigation';
  import { blurOnEscape } from '$lib/element';
  import { getZodErrorMessage } from '$lib/utils/zod';
  import apiRequest from '$lib/api';
  import Select from '$lib/components/Select.svelte';
  import { tick } from 'svelte';

  let firstInput: HTMLInputElement | null = null;
  let validateError: ZodError | null = null;

  $: err = {
    id: getZodErrorMessage(validateError, ['id']),
    name: getZodErrorMessage(validateError, ['name']),
    courseId: getZodErrorMessage(validateError, ['courseId']),
    planId: getZodErrorMessage(validateError, ['planId']),
  };

  const params = { limit: '9999' };
  const course =
    apiRequest('/api/course').get<
      ResponseDataInfo<LogInfo<Course & { detail: (CourseDetail & { subject: Subject })[] }>>
    >(params);
  const plan =
    apiRequest('/api/plan').get<
      ResponseDataInfo<
        LogInfo<Plan & { detail: (PlanDetail & { subject: Subject })[]; course: Course }>
      >
    >(params);

  const courseOptions = async () =>
    (await course).data
      .sort((a, b) => a.name.localeCompare(b.name))
      .map((v) => ({ label: v.name, value: v.id }));

  const planOptions = async () =>
    (await plan).data
      .sort((a, b) => a.name.localeCompare(b.name))
      .map((v) => ({ label: v.name, value: v.id, data: v }));

  export let edit = false;

  export let id = '';
  export let name = '';
  export let courseId = '';
  export let planId = '';

  let currentCourse: Awaited<typeof course>['data'][number] | undefined;

  function resetState() {
    id = name = courseId = planId = '';
  }

  export let callback: (data: unknown) => void = () => {
    // do nothing
  };

  async function handleEdit() {
    validateError = null;

    const parsed = groupSchema.safeParse({ id, name, planId, courseId });

    if (!parsed.success) return handleError(parsed.error);

    const ret = await apiRequest('/api/group')
      .put(parsed.data)
      .catch((e) => console.error(e));

    if (ret) await postSubmit(ret);
  }

  async function handleNew() {
    validateError = null;

    const parsed = groupSchema.omit({ id: true }).safeParse({ name, planId, courseId });

    if (!parsed.success) return handleError(parsed.error);

    const ret = await apiRequest('/api/group')
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
    await invalidate('data:group');
    resetState();
    callback(data);
  }

  async function handleCourse() {
    await tick();
    currentCourse = (await course).data.find((v) => v.id === courseId);
  }
</script>

<form on:submit|preventDefault="{() => (edit ? handleEdit() : handleNew())}" class="space-y-4">
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
        placeholder="Group Name"
        class="input"
        class:border-red-600="{err.name}"
        bind:value="{name}"
        use:blurOnEscape
      />
    </div>
    {#if err.name} <div class="col-span-4 col-start-3 text-red-600">{err.name.join()}</div> {/if}
  </section>
  <section id="input-course" class="grid grid-cols-6">
    <div class="col-span-2 flex items-center">
      <label for="form-group-course" class="font-semibold">
        Course <span class="text-red-600">*</span>
      </label>
    </div>
    <div class="col-span-4" class:invalid="{err.courseId}">
      {#await courseOptions()}
        <Select options="{[]}" placeholder="Loading..." />
      {:then options}
        <Select
          id="form-group-course"
          options="{options}"
          bind:value="{courseId}"
          on:change="{handleCourse}"
          placeholder="Select Course"
        />
      {/await}
    </div>
    {#if err.courseId}
      <div class="col-span-4 col-start-3 text-red-600">{err.courseId.join()}</div>
    {/if}
  </section>
  <section id="input-plan" class="grid grid-cols-6">
    <div class="col-span-2 flex items-center">
      <label for="form-group-plan" class="font-semibold">
        Plan <span class="text-red-600">*</span>
      </label>
    </div>
    <div class="col-span-4" class:invalid="{err.planId}">
      {#await planOptions()}
        <Select options="{[]}" placeholder="Loading..." />
      {:then options}
        <Select
          id="form-group-plan"
          options="{options.filter((v) => v.data.course.id === currentCourse?.id)}"
          bind:value="{planId}"
          placeholder="Select Plan"
        />
      {/await}
    </div>
    {#if err.planId}
      <div class="col-span-4 col-start-3 text-red-600">{err.planId.join()}</div>
    {/if}
  </section>

  <button type="submit" class="button w-full">Save</button>
</form>
