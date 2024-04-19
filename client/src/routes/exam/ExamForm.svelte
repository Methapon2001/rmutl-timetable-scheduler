<script lang="ts">
  import type { ZodError } from 'zod';
  import type {
    Section,
    Course,
    Group,
    LogInfo,
    Plan,
    PlanDetail,
    ResponseDataInfo,
    Building,
    Room,
    Instructor,
    Subject,
    CourseDetail,
  } from '$lib/types';
  import { onMount, tick } from 'svelte';
  import toast from 'svelte-french-toast';

  import { examSchema } from '$lib/types';
  import { invalidate } from '$app/navigation';
  import { getZodErrorMessage as getErrMsg } from '$lib/utils/zod';
  import { info } from '$lib/stores';
  import apiRequest from '$lib/api';

  import Select from '$lib/components/Select.svelte';

  let firstInput: HTMLInputElement | null = null;
  let validateError: ZodError | null = null;

  $: err = {
    roomId: getErrMsg(validateError, ['roomId']),
    section: getErrMsg(validateError, ['section']),
    instructor: getErrMsg(validateError, ['instructor']),
  };

  type SectionResponse = ResponseDataInfo<
    LogInfo<
      Section & {
        parent: Section | null;
        child: (Section & {
          room: (Room & { building: Building }) | null;
          instructor: Instructor[];
          subject: Subject;
          group: Group | null;
        })[];
        group:
          | (Group & {
              plan: Plan & { detail: (PlanDetail & { subject: Subject })[] };
              course: Course & { detail: (CourseDetail & { subject: Subject })[] };
            })
          | null;
        room: (Room & { building: Building }) | null;
        instructor: Instructor[];
        subject: Subject;
      }
    >
  >;

  const _params = { limit: '9999' };
  const _instructor =
    apiRequest('/api/instructor').get<ResponseDataInfo<LogInfo<Instructor>>>(_params);
  const _room =
    apiRequest('/api/room').get<ResponseDataInfo<LogInfo<Room & { building: Building }>>>(_params);
  const _section = apiRequest('/api/section').get<SectionResponse>(
    $info ? { ..._params, semester: `${$info.semester}`, year: `${$info.year}` } : _params,
  );
  const _noExamSection = apiRequest('/api/section').get<SectionResponse>(
    $info
      ? { ..._params, semester: `${$info.semester}`, year: `${$info.year}`, exam_filtered: '1' }
      : _params,
  );

  const instructorOptions = _instructor.then((s) =>
    s.data
      .sort((a, b) => a.name.localeCompare(b.name))
      .map((v) => ({ label: v.name, value: v.id })),
  );
  const roomOptions = _room.then((s) =>
    s.data
      .sort(
        (a, b) => a.building.code.localeCompare(b.building.code) || a.name.localeCompare(b.name),
      )
      .map((v) => ({
        label: `${v.building.code}-${v.name} (${
          v.type.charAt(0).toLocaleUpperCase() + v.type.slice(1)
        })`,
        value: v.id,
        data: v,
      })),
  );
  const sectionOptions = async () =>
    (await _section).data
      .sort(
        (a, b) =>
          a.subject.name.localeCompare(b.subject.name) ||
          a.subject.code.localeCompare(b.subject.code),
      )
      .map((v) => ({
        label: `${v.subject.code} ${v.subject.name} SEC ${v.no}`,
        value: v.id,
        data: v,
      }));
  const noExamSectionOptions = async () =>
    (await _noExamSection).data
      .sort(
        (a, b) =>
          a.subject.name.localeCompare(b.subject.name) ||
          a.subject.code.localeCompare(b.subject.code),
      )
      .map((v) => ({
        label: `${v.subject.code} ${v.subject.name} SEC ${v.no}`,
        value: v.id,
        data: v,
      }));

  const realSectionOptions = async () => {
    const [a, b] = [await sectionOptions(), await noExamSectionOptions()];

    return [...b, ...a.filter((v) => (edit ? section.some((x) => x === v.value) : false))];
  };

  export let callback: (data: unknown) => void = () => {
    // do nothing
  };

  export let edit = false;

  export let id = '';
  export let roomId = '';
  export let section: string[] = [];
  export let instructor: string[] = [];

  let currentSubject: Awaited<typeof _section>['data'][number]['subject'] | undefined;

  async function handleSection() {
    await tick();
    currentSubject = edit
      ? (await _section).data.find((v) => v.id === section[0])?.subject
      : (await _noExamSection).data.find((v) => v.id === section[0])?.subject;

    console.log(currentSubject);
  }

  async function handleEdit() {
    validateError = null;

    const parsed = examSchema.safeParse({ id, roomId, section, instructor });

    if (!parsed.success) return handleError(parsed.error);

    const ret = await apiRequest('/api/exam')
      .put(parsed.data)
      .catch((e) => console.error(e));

    if (ret) await postSubmit(ret);
  }

  async function handleNew() {
    validateError = null;

    const parsed = examSchema.omit({ id: true }).safeParse({ id, roomId, section, instructor });

    if (!parsed.success) return handleError(parsed.error);

    const ret = await apiRequest('/api/exam')
      .post(parsed.data)
      .catch((e) => console.error(e));

    if (ret) await postSubmit(ret);
  }

  function handleError(error: ZodError) {
    validateError = error;
  }

  function resetState() {
    id = roomId = '';
    section = instructor = [];
    currentSubject = undefined;
  }

  async function postSubmit(data: unknown) {
    firstInput?.focus();
    await invalidate('data:exam');
    toast.success('Success');
    resetState();
    callback(data);
  }

  onMount(handleSection);
</script>

<form on:submit|preventDefault="{() => (edit ? handleEdit() : handleNew())}" class="space-y-4">
  <section id="form-input-section" class="grid grid-cols-6">
    <div class="col-span-2 flex items-center">
      <label for="input-section" class="font-semibold">
        Section <span class="text-red-600">*</span>
      </label>
    </div>
    <div class="col-span-4" class:invalid="{err.section}">
      {#await realSectionOptions()}
        <Select options="{[]}" placeholder="Loading..." />
      {:then options}
        <Select
          id="input-section"
          options="{options.filter((v) =>
            !currentSubject ? true : v.data.subject.id === currentSubject.id,
          )}"
          placeholder="Select Section"
          bind:value="{section}"
          on:change="{handleSection}"
          multiple
        />
      {/await}
    </div>
    {#if err.section}
      <div class="col-span-4 col-start-3 text-red-600">{err.section.join()}</div>
    {/if}
  </section>

  <section id="form-room" class="grid grid-cols-6">
    <div class="col-span-2 flex items-center">
      <label for="input-room" class="font-semibold">Room</label>
    </div>
    <div class="col-span-4" class:invalid="{err.roomId}">
      {#await roomOptions}
        <Select options="{[]}" placeholder="Loading..." />
      {:then options}
        <Select
          id="input-room"
          placeholder="Not Specified (Optional)"
          options="{options}"
          bind:value="{roomId}"
        />
      {/await}
    </div>
    {#if err.roomId}
      <div class="col-span-4 col-start-3 text-red-600">{err.roomId.join()}</div>
    {/if}
  </section>

  <section id="form-instructor" class="grid grid-cols-6">
    <div class="col-span-2 flex items-center">
      <label for="input-instructor" class="font-semibold">Instructor</label>
    </div>
    <div class="col-span-4" class:invalid="{err.instructor}">
      {#await instructorOptions}
        <Select options="{[]}" placeholder="Loading..." />
      {:then options}
        <Select
          id="input-instructor"
          placeholder="Not Specified (Optional)"
          options="{options}"
          bind:value="{instructor}"
          multiple
        />
      {/await}
    </div>
    {#if err.instructor}
      <div class="col-span-4 col-start-3 text-red-600">{err.instructor.join()}</div>
    {/if}
  </section>

  <button type="submit" class="button w-full">Save</button>
</form>
