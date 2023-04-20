<script lang="ts">
  import { type ZodError, z } from 'zod';
  import { invalidate } from '$app/navigation';
  import { blurOnEscape } from '$lib/utils/directives';
  import { getZodErrorMessage } from '$lib/utils/zod';
  import { createRoom, editRoom } from '$lib/api/room';
  import { onMount } from 'svelte';
  import Select from '$lib/components/Select.svelte';

  const typeOptions: {
    label: string;
    value: string;
    disabled?: boolean;
    preselected?: boolean;
  }[] = [
    {
      label: 'Lab',
      value: 'lab',
    },
    {
      label: 'Lecture',
      value: 'lecture',
    },
    {
      label: 'Both',
      value: 'both',
    },
  ];

  const schema = z.object({
    id: z.string().nonempty(),
    name: z.string().min(3),
    type: z.string().nonempty({ message: 'Must select one of the options.' }),
    buildingId: z.string().nonempty({ message: 'Must select one of the options.' }),
  });

  const newSchema = schema.omit({
    id: true,
  });

  export let buildingOptions: {
    label: string;
    value: string;
    disabled?: boolean;
    preselected?: boolean;
  }[];

  export let edit = false;
  export let editData: typeof form.data = {
    id: '',
    name: '',
    type: '',
    buildingId: '',
  };

  export let callback: () => void = function () {
    // do nothing.
  };

  let form: {
    data: z.infer<typeof schema>;
    error: ZodError | undefined;
  } = {
    data: {
      id: '',
      name: '',
      type: '',
      buildingId: '',
    },
    error: undefined,
  };

  // Must have to reset selected value of select component (Needed for single select only)
  let selected = {
    type: [],
    buildingId: [],
  };

  async function handleSubmit() {
    return edit ? await handleEdit() : await handleCreate();
  }

  async function handleCreate() {
    form.error = undefined;

    const result = newSchema.safeParse(form.data);

    if (!result.success) {
      form.error = result.error;
      return;
    }

    const ret = await createRoom(result.data).catch((r: Response) => console.error(r));

    if (ret) {
      form.data = {
        id: '',
        name: '',
        type: '',
        buildingId: '',
      };

      selected = {
        type: [],
        buildingId: [],
      };

      await invalidate('data:room');

      callback();
    }
  }

  async function handleEdit() {
    form.error = undefined;

    const result = schema.safeParse(form.data);

    if (!result.success) {
      form.error = result.error;
      return;
    }

    const ret = await editRoom(result.data).catch((r: Response) => console.error(r));

    if (ret) {
      form.data = {
        id: '',
        name: '',
        type: '',
        buildingId: '',
      };

      selected = {
        type: [],
        buildingId: [],
      };

      await invalidate('data:room');

      callback();
    }
  }

  onMount(() => {
    if (edit && editData) {
      form.data = editData;
    }
  });
</script>

<form on:submit|preventDefault={() => handleSubmit()} class="space-y-4">
  <section id="input-building" class="grid grid-cols-6">
    <div class="col-span-2 flex items-center">
      <label for="" class="font-semibold">
        Building <span class="text-red-600">*</span>
      </label>
    </div>
    <div
      class="col-span-4"
      class:invalid={form.error && getZodErrorMessage(form.error, ['buildingId']).length > 0}
    >
      <Select
        options={buildingOptions}
        bind:value={form.data.buildingId}
        bind:selected={selected.buildingId}
      />
    </div>
    <div class="col-span-4 col-start-3 text-red-600">
      {form.error ? getZodErrorMessage(form.error, ['buildingId']) : ''}
    </div>
  </section>
  <section id="input-type" class="grid grid-cols-6">
    <div class="col-span-2 flex items-center">
      <label for="" class="font-semibold">
        Type <span class="text-red-600">*</span>
      </label>
    </div>
    <div
      class="col-span-4"
      class:invalid={form.error && getZodErrorMessage(form.error, ['type']).length > 0}
    >
      <Select options={typeOptions} bind:value={form.data.type} bind:selected={selected.type} />
    </div>
    <div class="col-span-4 col-start-3 text-red-600">
      {form.error ? getZodErrorMessage(form.error, ['type']) : ''}
    </div>
  </section>
  <section id="input-name" class="grid grid-cols-6">
    <div class="col-span-2 flex text-center">
      <label for="" class="font-semibold">
        Name <span class="text-red-600">*</span>
      </label>
    </div>
    <div class="col-span-4">
      <input
        type="text"
        class="input
          {form.error && getZodErrorMessage(form.error, ['name']).length > 0
          ? 'border border-red-600'
          : ''}"
        bind:value={form.data.name}
        use:blurOnEscape
      />
    </div>
    <div class="col-span-4 col-start-3 text-red-600">
      {form.error ? getZodErrorMessage(form.error, ['name']) : ''}
    </div>
  </section>

  <button type="submit" class="button w-full">Save</button>
</form>
