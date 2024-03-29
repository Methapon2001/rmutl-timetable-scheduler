<script lang="ts">
  import { type ZodError, z } from 'zod';
  import { invalidate } from '$app/navigation';
  import { blurOnEscape } from '$lib/utils/directives';
  import { getZodErrorMessage } from '$lib/utils/zod';
  import { createRoom, editRoom } from '$lib/api/room';
  import { onMount } from 'svelte';
  import Select from '$lib/components/Select.svelte';
  import toast from 'svelte-french-toast';

  const typeOptions: {
    label: string;
    value: string;
    disabled?: boolean;
  }[] = [
    {
      label: 'Lecture',
      value: 'lecture',
    },
    {
      label: 'Lab',
      value: 'lab',
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

  let firstInput: HTMLInputElement;

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

      await invalidate('data:room');

      callback();

      firstInput.focus();

      toast.success('Room Created!');
    } else {
      toast.error('Fail to create Room!');
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

      await invalidate('data:room');

      callback();

      toast.success('Edit Complete');
    } else {
      toast.error('Fail to Edit Room!');
    }
  }

  onMount(() => {
    if (edit && editData) {
      form.data = editData;
    }
  });
</script>

<form on:submit|preventDefault="{() => handleSubmit()}" class="space-y-4">
  <section id="input-building" class="grid grid-cols-6">
    <div class="col-span-2 flex items-center">
      <label for="" class="font-semibold">
        Building <span class="text-red-600">*</span>
      </label>
    </div>
    <div
      class="col-span-4"
      class:invalid="{form.error && getZodErrorMessage(form.error, ['buildingId']).length > 0}"
    >
      <Select
        options="{buildingOptions}"
        bind:value="{form.data.buildingId}"
        placeholder="Select Building"
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
      class:invalid="{form.error && getZodErrorMessage(form.error, ['type']).length > 0}"
    >
      <Select
        options="{typeOptions}"
        bind:value="{form.data.type}"
        placeholder="Select Room Type"
      />
    </div>
    <div class="col-span-4 col-start-3 text-red-600">
      {form.error ? getZodErrorMessage(form.error, ['type']) : ''}
    </div>
  </section>
  <section id="input-name" class="grid grid-cols-6">
    <div class="col-span-2 flex items-center">
      <label for="" class="font-semibold">
        Name <span class="text-red-600">*</span>
      </label>
    </div>
    <div class="col-span-4">
      <input
        type="text"
        placeholder="Room Name"
        class="input
          {form.error && getZodErrorMessage(form.error, ['name']).length > 0
          ? 'border border-red-600'
          : ''}"
        bind:value="{form.data.name}"
        bind:this="{firstInput}"
        use:blurOnEscape
      />
    </div>
    <div class="col-span-4 col-start-3 text-red-600">
      {form.error ? getZodErrorMessage(form.error, ['name']) : ''}
    </div>
  </section>

  <button type="submit" class="button w-full">Save</button>
</form>
