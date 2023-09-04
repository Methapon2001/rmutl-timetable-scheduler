<script lang="ts">
  import type { ZodError } from 'zod';
  import type { Building, ResponseDataInfo, LogInfo } from '$lib/types';
  import toast from 'svelte-french-toast';

  import { roomSchema } from '$lib/types';
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
    type: getZodErrorMessage(validateError, ['type']),
    buildingId: getZodErrorMessage(validateError, ['buildingId']),
  };

  const building = apiRequest('/api/building').get<ResponseDataInfo<LogInfo<Building>>>({
    limit: '9999',
  });

  const buildingOptions = async () =>
    (await building).data
      .sort((a, b) => a.name.localeCompare(b.name))
      .map((v) => ({ label: v.name, value: v.id }));

  const roomTypeOptions = [
    { label: 'Lecture', value: 'lecture' },
    { label: 'Lab', value: 'lab' },
    { label: 'Lecture/Lab', value: 'both' },
  ];

  export let edit = false;

  export let id = '';
  export let name = '';
  export let type = '';
  export let buildingId = '';

  function resetState() {
    id = name = type = buildingId = '';
  }

  export let callback: (data: unknown) => void = () => {
    // do nothing
  };

  async function handleEdit() {
    validateError = null;

    const parsed = roomSchema.safeParse({ id, name, type, buildingId });

    if (!parsed.success) return handleError(parsed.error);

    const ret = await apiRequest('/api/room')
      .put(parsed.data)
      .catch((e) => console.error(e));

    if (ret) await postSubmit(ret);
  }

  async function handleNew() {
    validateError = null;

    const parsed = roomSchema.omit({ id: true }).safeParse({ id, name, type, buildingId });

    if (!parsed.success) return handleError(parsed.error);

    const ret = await apiRequest('/api/room')
      .post(parsed.data)
      .catch((e) => console.error(e));

    if (ret) await postSubmit(ret);
  }

  function handleError(error: ZodError) {
    validateError = error;
  }

  async function postSubmit(data: unknown) {
    firstInput?.focus();
    await invalidate('data:room');
    toast.success('Success');
    resetState();
    callback(data);
  }
</script>

<form on:submit|preventDefault="{() => (edit ? handleEdit() : handleNew())}" class="space-y-4">
  <section id="input-building" class="grid grid-cols-6">
    <div class="col-span-2 flex items-center">
      <label for="form-room-building" class="font-semibold">
        Building <span class="text-red-600">*</span>
      </label>
    </div>
    <div class="col-span-4" class:invalid="{err.buildingId}">
      {#await buildingOptions()}
        <Select options="{[]}" placeholder="Loading..." />
      {:then options}
        <Select
          id="form-room-building"
          options="{options}"
          bind:value="{buildingId}"
          placeholder="Select Building"
        />
      {/await}
    </div>
    {#if err.buildingId}
      <div class="col-span-4 col-start-3 text-red-600">{err.buildingId.join()}</div>
    {/if}
  </section>
  <section id="input-type" class="grid grid-cols-6">
    <div class="col-span-2 flex items-center">
      <label for="form-room-type" class="font-semibold">
        Type <span class="text-red-600">*</span>
      </label>
    </div>
    <div class="col-span-4" class:invalid="{err.type}">
      <Select
        id="form-room-type"
        options="{roomTypeOptions}"
        bind:value="{type}"
        placeholder="Select Room Type"
      />
    </div>
    {#if err.type}
      <div class="col-span-4 col-start-3 text-red-600">{err.type.join()}</div>
    {/if}
  </section>
  <section id="input-name" class="grid grid-cols-6 items-center">
    <div class="col-span-2">
      <label for="form-room-name" class="font-semibold">
        Name <span class="text-red-600">*</span>
      </label>
    </div>
    <div class="col-span-4">
      <input
        id="form-room-name"
        type="text"
        placeholder="Room Name"
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
