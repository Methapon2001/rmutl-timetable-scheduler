<script lang="ts">
  import type { ZodError } from 'zod';
  import type {
    ResponseDataInfo,
    LogInfo,
    Subject,
    Instructor,
    Building,
    Room,
    Group,
  } from '$lib/types';
  import { onMount, tick } from 'svelte';
  import toast from 'svelte-french-toast';

  import { sectionNewSchema } from '$lib/types';
  import { invalidate } from '$app/navigation';
  import { blurOnEscape } from '$lib/utils/directives';
  import { getZodErrorMessage as getErrMsg } from '$lib/utils/zod';
  import { info } from '$lib/stores';
  import apiRequest from '$lib/api';
  import Select from '$lib/components/Select.svelte';
  import CrossIcon from '$lib/icons/CrossIcon.svelte';

  let firstInput: HTMLInputElement | null = null;
  let validateError: ZodError | null = null;

  $: err = {
    no: getErrMsg(validateError, ['no']),
    alt: getErrMsg(validateError, ['alt']),
    type: getErrMsg(validateError, ['type']),
    manual: getErrMsg(validateError, ['manual']),
    subjectId: getErrMsg(validateError, ['subjectId']),
    groupId: getErrMsg(validateError, ['groupId']),
  };

  const params = { limit: '9999' };
  const subject = apiRequest('/api/subject').get<ResponseDataInfo<LogInfo<Subject>>>(params);
  const instructor =
    apiRequest('/api/instructor').get<ResponseDataInfo<LogInfo<Instructor>>>(params);
  const room =
    apiRequest('/api/room').get<ResponseDataInfo<LogInfo<Room & { building: Building }>>>(params);
  const group = apiRequest('/api/group').get<ResponseDataInfo<LogInfo<Group>>>(
    $info ? { ...params, semester: `${$info.semester}`, year: `${$info.year}` } : params,
  );

  const subjectOptions = subject.then((s) =>
    s.data
      .sort((a, b) => a.name.localeCompare(b.name) || a.code.localeCompare(b.code))
      .map((v) => ({ label: v.name, value: v.id })),
  );
  const instructorOptions = instructor.then((s) =>
    s.data
      .sort((a, b) => a.name.localeCompare(b.name))
      .map((v) => ({ label: v.name, value: v.id })),
  );
  const roomOptions = room.then((s) =>
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
  const groupOptions = group.then((s) =>
    s.data
      .sort((a, b) => a.name.localeCompare(b.name))
      .map((v) => ({ label: v.name, value: v.id })),
  );

  export let callback: (data: unknown) => void = () => {
    // do nothing
  };

  export let type = '';
  export let alt = '';
  export let subjectId = '';
  export let groupId = '';
  export let manual = false;
  export let no: number | null = null;
  export let section: {
    roomId: string;
    instructor: string[];
    capacity: number;
  }[] = [];

  export let lock = false;

  let currentSubject: Awaited<typeof subject>['data'][number] | undefined;

  onMount(async () => {
    if (lock && !subjectId) throw new Error('Subject is required when mode is enabled.');
    if (lock && !groupId) throw new Error('Group is required when mode is enabled.');
    if (lock) handleSubject();
  });

  function resetState() {
    type = alt = subjectId = groupId = '';
    manual = false;
    no = null;
    section = [];
    currentSubject = undefined;
  }

  function addSection() {
    section = [
      ...section,
      {
        roomId: '',
        instructor: [],
        capacity: 0,
      },
    ];
  }

  async function removeSection(index: number) {
    if (
      (currentSubject &&
        currentSubject.lab !== 0 &&
        currentSubject.lecture !== 0 &&
        section.length === 2) ||
      section.length === 1
    ) {
      toast.error('Cannot remove beyond minimum requirement(s).');
      return;
    }
    section = section.filter((_, idx) => idx !== index);
  }

  async function handleSubject() {
    await tick();

    currentSubject = (await subject).data.find((v) => v.id === subjectId);

    if (!currentSubject) return;

    type = currentSubject.lecture === 0 ? 'lab' : 'lecture';
    section = [
      {
        roomId: '',
        instructor: [],
        capacity: 0,
      },
    ];
    if (currentSubject.lecture > 0 && currentSubject.lab > 0) addSection();
  }

  /** For submit from outside this component */
  let external = false;

  $: formData = {
    type,
    alt,
    manual,
    no,
    subjectId,
    groupId,
    section,
  };

  async function handleSubmit() {
    validateError = null;

    const parsed = sectionNewSchema.safeParse(formData);

    if (!parsed.success) return handleError(parsed.error);

    const ret = await apiRequest('/api/section')
      .post(parsed.data)
      .catch((e) => console.error(e));

    if (ret && !external) await postSubmit(ret);
    if (ret && external) return ret;
  }

  /** Will be used to call submit simultaneously outside of the component */
  export async function submit() {
    external = true;
    return await handleSubmit();
  }

  /** Will be used before call submit simultaneously outside of the component */
  export function isError() {
    validateError = null;

    const parsed = sectionNewSchema.safeParse(formData);

    if (!parsed.success) handleError(parsed.error);

    return validateError ? true : false;
  }

  function handleError(error: ZodError) {
    validateError = error;
  }

  async function postSubmit(data: unknown) {
    firstInput?.focus();
    toast.success('Success');
    await invalidate('data:section');
    resetState();
    callback(data);
  }

  function handleCapacity(secIdx: number) {
    if (section.length === 0 || secIdx === 0) return;

    const max = section[0].capacity;
    const sum = section.reduce((a, c, i) => (i > 0 ? a + c.capacity : 0), 0);

    if (sum > max) {
      section[secIdx].capacity -= sum - max;
      toast.error('Total capacity must not exceed main section.');
    }
  }
</script>

<form on:submit|preventDefault="{() => !lock && handleSubmit()}" class="space-y-4">
  {#if !lock}
    <section id="input-subject" class="grid grid-cols-6">
      <div class="col-span-2 flex items-center">
        <label for="subject" class="font-semibold">
          Subject <span class="text-red-600">*</span>
        </label>
      </div>
      <div class="col-span-4" class:invalid="{err.subjectId}">
        {#await subjectOptions}
          <Select options="{[]}" placeholder="Loading..." />
        {:then options}
          <Select
            options="{options}"
            placeholder="Select Subject"
            bind:value="{subjectId}"
            on:change="{() => handleSubject()}"
          />
        {/await}
      </div>
      {#if err.subjectId}
        <div class="col-span-4 col-start-3 text-red-600">{err.subjectId.join()}</div>
      {/if}
    </section>
  {/if}

  {#if currentSubject}
    {#if !lock}
      <section id="form-manual" class="grid grid-cols-6">
        <div class="col-span-2 flex items-center">
          <label for="input-manual" class="font-semibold">
            Section No. <span class="text-red-600">*</span>
          </label>
        </div>
        <div class="col-span-4">
          <label><input type="radio" bind:group="{manual}" value="{false}" /> Auto</label>
          <div class="flex items-center gap-4">
            <label class="whitespace-nowrap">
              <input type="radio" bind:group="{manual}" value="{true}" /> Manual
            </label>
            <input
              id="input-manual"
              type="number"
              class="input w-fit text-center"
              bind:value="{no}"
              disabled="{!manual}"
              min="{1}"
              max="{1000}"
              use:blurOnEscape
            />
          </div>
        </div>
        {#if err.no}
          <div class="col-span-4 col-start-3 text-red-600">{err.no.join(', ')}</div>
        {/if}
      </section>
      <section id="input-alt" class="grid grid-cols-6">
        <div class="col-span-2 flex items-center">
          <label for="" class="font-semibold"> Alternate Section No. </label>
        </div>
        <div class="col-span-4">
          <input
            placeholder="1, 2, 3, 4 or 1 2 3 4 (Optional)"
            type="text"
            class="input"
            class:border-red-600="{err.alt}"
            bind:value="{err.alt}"
            use:blurOnEscape
          />
        </div>
        {#if err.alt}
          <div class="col-span-4 col-start-3 text-red-600">{err.alt.join(', ')}</div>
        {/if}
      </section>
      <section id="form-group" class="grid grid-cols-6">
        <div class="col-span-2 flex items-center">
          <label for="input-group" class="font-semibold"> Group </label>
        </div>
        <div class="col-span-4" class:invalid="{err.groupId}">
          {#await groupOptions}
            <Select options="{[]}" placeholder="Loading..." />
          {:then options}
            <Select
              id="input-group"
              placeholder="Not Specified (Optional)"
              options="{options}"
              bind:value="{groupId}"
            />
          {/await}
        </div>
        {#if err.groupId}
          <div class="col-span-4 col-start-3 text-red-600">{err.groupId.join(', ')}</div>
        {/if}
      </section>
    {/if}
  {/if}

  {#each section as sec, secIdx (secIdx)}
    {@const secErr = {
      roomId: getErrMsg(validateError, ['section', secIdx, 'roomId']),
      instructor: getErrMsg(validateError, ['section', secIdx, 'instructor']),
      capacity: getErrMsg(validateError, ['section', secIdx, 'capacity']),
    }}
    <div class="relative space-y-4 rounded border p-3">
      <button
        type="button"
        class="absolute right-0 top-0 p-3"
        on:click="{() => removeSection(secIdx)}"
      >
        <CrossIcon />
      </button>
      <h2 class="font-2xl !mt-0 text-center font-semibold capitalize">
        {secIdx === 0 ? type : `lab ${secIdx}`}
      </h2>
      <section id="form-room" class="grid grid-cols-6">
        <div class="col-span-2 flex items-center">
          <label for="input-room" class="font-semibold">Room</label>
        </div>
        <div class="col-span-4" class:invalid="{secErr.roomId}">
          {#await roomOptions}
            <Select options="{[]}" placeholder="Loading..." />
          {:then options}
            <Select
              id="input-room"
              placeholder="Not Specified (Optional)"
              options="{options.filter(
                (v) =>
                  v.data.type === 'both' ||
                  (secIdx === 0 && v.data.type === type) ||
                  (secIdx !== 0 && v.data.type === 'lab'),
              )}"
              bind:value="{sec.roomId}"
            />
          {/await}
        </div>
        {#if secErr.roomId}
          <div class="col-span-4 col-start-3 text-red-600">{secErr.roomId.join()}</div>
        {/if}
      </section>
      <section id="form-instructor" class="grid grid-cols-6">
        <div class="col-span-2 flex items-center">
          <label for="input-instructor" class="font-semibold">Instructor</label>
        </div>
        <div class="col-span-4" class:invalid="{secErr.instructor}">
          {#await instructorOptions}
            <Select options="{[]}" placeholder="Loading..." />
          {:then options}
            <Select
              id="input-instructor"
              placeholder="Not Specified (Optional)"
              options="{options}"
              bind:value="{sec.instructor}"
              multiple
            />
          {/await}
        </div>
        {#if secErr.instructor}
          <div class="col-span-4 col-start-3 text-red-600">{secErr.instructor.join()}</div>
        {/if}
      </section>
      <section id="input-capacity" class="grid grid-cols-6">
        <div class="col-span-2 flex items-center">
          <label for="form-input-capacity" class="font-semibold">
            Capacity <span class="text-red-600">*</span>
          </label>
        </div>
        <div class="col-span-4">
          <input
            id="form-input-capacity"
            type="number"
            placeholder="Capacity"
            class="input w-fit text-center"
            class:border-red-600="{secErr.capacity}"
            bind:value="{sec.capacity}"
            on:change="{() => handleCapacity(secIdx)}"
            on:keyup="{() => handleCapacity(secIdx)}"
            use:blurOnEscape
            min="{0}"
            max="{300}"
          />
        </div>
        {#if secErr.capacity}
          <div class="col-span-4 col-start-3 text-red-600">{secErr.capacity.join()}</div>
        {/if}
      </section>
    </div>
  {/each}

  {#if currentSubject && currentSubject.lab !== 0}
    <div class="flex justify-center">
      <button type="button" class="button" on:click="{() => addSection()}">
        Add Lab Section
      </button>
    </div>
  {/if}

  {#if !lock}
    <button type="submit" class="button w-full">Save</button>
  {/if}
</form>
