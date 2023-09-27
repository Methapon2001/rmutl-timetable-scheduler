<script lang="ts">
  import type { ZodError } from 'zod';
  import type {
    ResponseDataInfo,
    LogInfo,
    Instructor,
    Building,
    Room,
    Group,
    Subject,
    Section,
  } from '$lib/types';
  import toast from 'svelte-french-toast';

  import { sectionEditSchema } from '$lib/types';
  import { invalidate } from '$app/navigation';
  import { blurOnEscape } from '$lib/utils/directives';
  import { getZodErrorMessage as getErrMsg } from '$lib/utils/zod';
  import { info } from '$lib/stores';
  import apiRequest from '$lib/api';
  import Select from '$lib/components/Select.svelte';

  let firstInput: HTMLInputElement | null = null;
  let validateError: ZodError | null = null;

  $: err = {
    id: getErrMsg(validateError, ['id']),
    alt: getErrMsg(validateError, ['alt']),
    groupId: getErrMsg(validateError, ['groupId']),
    roomId: getErrMsg(validateError, ['roomId']),
    instructorId: getErrMsg(validateError, ['instructor']),
    capacity: getErrMsg(validateError, ['capacity']),
  };

  const params = { limit: '9999' };
  const instructor =
    apiRequest('/api/instructor').get<ResponseDataInfo<LogInfo<Instructor>>>(params);
  const room =
    apiRequest('/api/room').get<ResponseDataInfo<LogInfo<Room & { building: Building }>>>(params);
  const group = apiRequest('/api/group').get<ResponseDataInfo<LogInfo<Group>>>(
    $info ? { ...params, semester: `${$info.semester}`, year: `${$info.year}` } : params,
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

  export let id: string;
  /** Editable zone */
  export let alt: string;
  export let roomId: string;
  export let groupId: string;
  export let instructorId: string[];
  export let capacity: number;
  /** Readonly zone */
  export let no: number;
  export let lab: number | null;
  export let type: Section['type'];
  export let subject: Subject;

  async function handleSubmit() {
    validateError = null;

    const parsed = sectionEditSchema.safeParse({
      id,
      alt,
      groupId,
      instructor: instructorId,
      roomId,
      capacity,
    });

    if (!parsed.success) return handleError(parsed.error);

    const ret = await apiRequest('/api/section')
      .put(parsed.data)
      .catch((e) => console.error(e));

    if (ret) await postSubmit(ret);
  }

  function handleError(error: ZodError) {
    validateError = error;
    console.error(validateError);
  }

  async function postSubmit(data: unknown) {
    firstInput?.focus();
    toast.success('Success');
    await invalidate('data:section');
    callback(data);
  }
</script>

<form class="space-y-4" on:submit|preventDefault="{() => handleSubmit()}">
  <section class="text-center">
    <h1 class="mb-1 text-2xl font-bold">{subject.code} {subject.name}</h1>
    <h2 class="!mt-1 text-xl text-secondary">Section {no + (lab !== null ? ` Lab ${lab}` : '')}</h2>
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
          options="{options.filter((v) => v.data.type === 'both' || v.data.type === type)}"
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
    <div class="col-span-4" class:invalid="{err.instructorId}">
      {#await instructorOptions}
        <Select options="{[]}" placeholder="Loading..." />
      {:then options}
        <Select
          id="input-instructor"
          placeholder="Not Specified (Optional)"
          options="{options}"
          bind:value="{instructorId}"
          multiple
        />
      {/await}
    </div>
    {#if err.instructorId}
      <div class="col-span-4 col-start-3 text-red-600">{err.instructorId.join()}</div>
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
        class:border-red-600="{err.capacity}"
        bind:value="{capacity}"
        use:blurOnEscape
        min="{0}"
        max="{300}"
      />
    </div>
    {#if err.capacity}
      <div class="col-span-4 col-start-3 text-red-600">{err.capacity.join()}</div>
    {/if}
  </section>

  <button type="submit" class="button w-full">Save</button>
</form>
