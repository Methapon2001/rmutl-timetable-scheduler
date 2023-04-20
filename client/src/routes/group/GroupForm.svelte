<script lang="ts">
  import { type ZodError, z } from 'zod';
  import { invalidate } from '$app/navigation';
  import { blurOnEscape } from '$lib/utils/directives';
  import { getZodErrorMessage } from '$lib/utils/zod';
  import { createGroup, editGroup } from '$lib/api/group';
  import { onMount } from 'svelte';
  import Select from '$lib/components/Select.svelte';

  const schema = z.object({
    id: z.string().nonempty(),
    name: z.string().min(3),
    courseId: z.string().nonempty({ message: 'Must select one of the options.' }),
  });

  const newSchema = schema.omit({
    id: true,
  });

  export let courseOptions: {
    label: string;
    value: string;
    disabled?: boolean;
    preselected?: boolean;
  }[];

  export let edit = false;
  export let editData: typeof form.data = {
    id: '',
    name: '',
    courseId: '',
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
      courseId: '',
    },
    error: undefined,
  };

  // Must have to reset selected value of select component (Needed for single select only)
  let selected = {
    courseId: edit && editData ? [editData.courseId] : [],
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

    const ret = await createGroup(result.data).catch((r: Response) => console.error(r));

    if (ret) {
      form.data = {
        id: '',
        name: '',
        courseId: '',
      };

      selected = {
        courseId: [],
      };

      await invalidate('data:group');

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

    const ret = await editGroup(result.data).catch((r: Response) => console.error(r));

    if (ret) {
      form.data = {
        id: '',
        name: '',
        courseId: '',
      };

      selected = {
        courseId: [],
      };

      await invalidate('data:group');

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
  <section id="input-name" class="grid grid-cols-6">
    <div class="col-span-2 flex items-center">
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
  <section id="input-course" class="grid grid-cols-6">
    <div class="col-span-2 flex items-center">
      <label for="" class="font-semibold">
        Course <span class="text-red-600">*</span>
      </label>
    </div>
    <div
      class="col-span-4"
      class:invalid={form.error && getZodErrorMessage(form.error, ['courseId']).length > 0}
    >
      <Select
        options={courseOptions}
        bind:value={form.data.courseId}
        bind:selected={selected.courseId}
      />
    </div>
    <div class="col-span-4 col-start-3 text-red-600">
      {form.error ? getZodErrorMessage(form.error, ['courseId']) : ''}
    </div>
  </section>

  <button type="submit" class="button w-full">Save</button>
</form>