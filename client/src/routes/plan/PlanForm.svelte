<script lang="ts">
  import type { ZodError } from 'zod';
  import type {
    ResponseDataInfo,
    LogInfo,
    Subject,
    PlanDetail,
    Course,
    CourseDetail,
  } from '$lib/types';
  import toast from 'svelte-french-toast';

  import { planSchema } from '$lib/types';
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
    detail: getZodErrorMessage(validateError, ['detail']),
    courseId: getZodErrorMessage(validateError, ['courseId']),
  };

  export let edit = false;

  export let id = '';
  export let name = '';
  export let detail: (Omit<PlanDetail, 'id'> & { subjectId: string })[] = [];
  export let courseId = '';

  /**
   * Necessary for edit mode
   */
  let groupedDetail: {
    year: number;
    semester: number;
    subjectId: string[];
  }[] =
    detail.length === 0
      ? [{ year: 1, semester: 1, subjectId: [] }]
      : Object.values(
          detail
            .sort((a, b) => b.year - a.year || b.semester - a.semester)
            .reduce<{ [key: string]: { year: number; semester: number; subjectId: string[] } }>(
              (acc, obj) => {
                const key = `${obj.year}-${obj.semester}`;
                if (!acc[key]) {
                  acc[key] = { year: obj.year, semester: obj.semester, subjectId: [] };
                }
                acc[key].subjectId.push(obj.subjectId);
                return acc;
              },
              {},
            ),
        );

  $: detail = groupedDetail.flatMap((val) =>
    val.subjectId.map((v) => ({ year: val.year, semester: val.semester, subjectId: v })),
  );

  const params = { limit: '9999' };
  const subject = apiRequest('/api/subject').get<ResponseDataInfo<LogInfo<Subject>>>(params);
  const course =
    apiRequest('/api/course').get<
      ResponseDataInfo<LogInfo<Course & { detail: (CourseDetail & { subject: Subject })[] }>>
    >(params);

  const subjectOptions = async () =>
    (await subject).data
      .sort((a, b) => a.name.localeCompare(b.name) || a.code.localeCompare(b.code))
      .map((v) => ({ label: `${v.code} ${v.name}`, value: v.id }));
  const courseOptions = async () =>
    (await course).data
      .sort((a, b) => a.name.localeCompare(b.name))
      .map((v) => ({ label: v.name, value: v.id, detail: v }));

  let selectedCourse: Awaited<ReturnType<typeof courseOptions>>[number]['detail'] | undefined;

  $: courseOptions()
    .then((opt) => opt.find((v) => v.value === courseId)?.detail)
    .then((v) => (selectedCourse = v));

  function resetState() {
    id = name = '';
    groupedDetail = [{ year: 1, semester: 1, subjectId: [] }];
  }

  export let callback: (data: unknown) => void = () => {
    // do nothing
  };

  async function handleEdit() {
    validateError = null;

    const parsed = planSchema.safeParse({ id, name, detail, courseId });

    if (!parsed.success) return handleError(parsed.error);

    const ret = await apiRequest('/api/plan')
      .put(parsed.data)
      .catch((e) => console.error(e));

    if (ret) await postSubmit(ret);
  }

  async function handleNew() {
    validateError = null;

    const parsed = planSchema.omit({ id: true }).safeParse({ id, name, detail, courseId });

    if (!parsed.success) return handleError(parsed.error);

    const ret = await apiRequest('/api/plan')
      .post(parsed.data)
      .catch((e) => console.error(e));

    if (ret) await postSubmit(ret);
  }

  function handleError(error: ZodError) {
    validateError = error;
  }

  async function postSubmit(data: unknown) {
    firstInput?.focus();
    await invalidate('data:plan');
    toast.success('Success');
    resetState();
    callback(data);
  }

  function resetDetail() {
    groupedDetail = [{ year: 1, semester: 1, subjectId: [] }];
  }

  function addDetail() {
    const last = groupedDetail.at(-1);

    groupedDetail = [
      ...groupedDetail,
      {
        year: !last ? 1 : last.semester === 3 ? last.year + 1 : last.year,
        semester: !last ? 1 : last.semester === 3 ? 1 : last.semester + 1,
        subjectId: [],
      },
    ];
  }

  function delDetail(index: number) {
    groupedDetail = groupedDetail.filter((_, idx) => idx !== index);
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
        id="form-plan-name"
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
  <section id="input-course" class="grid grid-cols-6">
    <div class="col-span-2 flex items-center">
      <label for="form-plan-course" class="font-semibold">
        Course <span class="text-red-600">*</span>
      </label>
    </div>
    <div class="col-span-4" class:invalid="{err.courseId}">
      {#await courseOptions()}
        <Select options="{[]}" placeholder="Loading..." />
      {:then options}
        <Select
          id="form-room-building"
          options="{options}"
          bind:value="{courseId}"
          placeholder="Select Course"
          on:change="{() => {
            resetDetail();
          }}"
        />
      {/await}
    </div>
    {#if err.courseId}
      <div class="col-span-4 col-start-3 text-red-600">{err.courseId.join()}</div>
    {/if}
  </section>

  {#if courseId}
    {#each groupedDetail as _, idx}
      <div class="space-y-4 rounded border p-4">
        <section id="input-year" class="grid grid-cols-6">
          <div class="col-span-2 flex items-center">
            <label for="form-plan-year-{idx}" class="font-semibold">
              Year <span class="text-red-600">*</span>
            </label>
          </div>
          <div class="col-span-4">
            <input
              id="form-plan-year-{idx}"
              type="number"
              class="input w-fit text-center"
              class:border-red-600="{err.detail}"
              bind:value="{groupedDetail[idx].year}"
              on:change="{() =>
                (groupedDetail[idx].year =
                  groupedDetail[idx].year > 8
                    ? 8
                    : groupedDetail[idx].year < 0
                    ? 0
                    : groupedDetail[idx].year)}"
              min="{0}"
              max="{8}"
              use:blurOnEscape
            />
          </div>
        </section>
        <section id="input-semester-{idx}" class="grid grid-cols-6">
          <div class="col-span-2 flex items-center">
            <label for="form-plan-semester-{idx}" class="font-semibold">
              Semester <span class="text-red-600">*</span>
            </label>
          </div>
          <div class="col-span-4">
            <input
              id="form-plan-semester-{idx}"
              type="number"
              class="input w-fit text-center"
              class:border-red-600="{err.detail}"
              bind:value="{groupedDetail[idx].semester}"
              on:change="{() =>
                (groupedDetail[idx].semester =
                  groupedDetail[idx].semester > 3
                    ? 3
                    : groupedDetail[idx].semester < 0
                    ? 0
                    : groupedDetail[idx].semester)}"
              min="{0}"
              max="{3}"
              use:blurOnEscape
            />
          </div>
        </section>
        <section id="input-plan-subject-{idx}" class="grid grid-cols-6">
          <div class="col-span-2 flex items-center">
            <label for="form-plan-subject-{idx}" class="font-semibold">Subject</label>
          </div>
          <div class="col-span-4" class:invalid="{err.detail}">
            {#await subjectOptions()}
              <Select options="{[]}" placeholder="Loading..." />
            {:then options}
              <Select
                id="form-plan-subject-{idx}"
                options="{options.filter(
                  (val) => selectedCourse?.detail.some((v) => v.subject.id === val.value) ?? false,
                )}"
                bind:value="{groupedDetail[idx].subjectId}"
                placeholder="Select Subject"
                multiple
              />
            {/await}
          </div>

          {#if err.detail}
            <div class="col-span-4 col-start-3 text-red-600">{err.detail.join()}</div>
          {/if}
        </section>
      </div>
      {#if err.detail}
        {@const errorMsg = getZodErrorMessage(validateError, ['detail'], false)}
        <div class="col-span-4 col-start-3 text-red-600">{errorMsg?.join() || ''}</div>
      {/if}
    {/each}

    <button type="button" class="button w-full" on:click="{() => addDetail()}"
      >Add Semester/Year</button
    >
  {/if}
  <button type="submit" class="button w-full">Save</button>
</form>
