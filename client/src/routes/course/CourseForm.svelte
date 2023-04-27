<script lang="ts">
  import { type ZodError, z } from 'zod';
  import { invalidate } from '$app/navigation';
  import { blurOnEscape } from '$lib/utils/directives';
  import { getZodErrorMessage } from '$lib/utils/zod';
  import { createCourse, editCourse } from '$lib/api/course';
  import { onMount } from 'svelte';
  import Select from '$lib/components/Select.svelte';
  import toast from 'svelte-french-toast';

  const schema = z.object({
    id: z.string().nonempty(),
    name: z.string().min(3),
    detail: z.object({
      compulsory: z.string().array(),
      elective: z.string().array(),
    }),
  });

  const newSchema = schema.omit({
    id: true,
  });

  export let subjectOptions: {
    label: string;
    value: string;
    disabled?: boolean;
    preselected?: boolean;
  }[];

  export let edit = false;
  export let editData: typeof form.data = {
    id: '',
    name: '',
    detail: {
      compulsory: [],
      elective: [],
    },
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
      detail: {
        compulsory: [],
        elective: [],
      },
    },
    error: undefined,
  };

  let firstInput: HTMLInputElement;

  async function handleSubmit() {
    return edit ? await handleEdit() : await handleCreate();
  }

  async function handleCreate() {
    form.error = undefined;

    const result = newSchema
      .transform((val) => ({
        ...val,
        detail: [
          ...val.detail.compulsory.map((v) => ({ subjectId: v, type: 'compulsory' })),
          ...val.detail.elective.map((v) => ({ subjectId: v, type: 'elective' })),
        ],
      }))
      .safeParse(form.data);

    if (!result.success) {
      form.error = result.error;
      return;
    }

    const ret = await createCourse(result.data).catch((r: Response) => console.error(r));

    if (ret) {
      form.data = {
        id: '',
        name: '',
        detail: {
          compulsory: [],
          elective: [],
        },
      };

      await invalidate('data:course');

      callback();

      firstInput.focus();

      toast.success('Course Created!');
    } else {
      toast.error('Fail to create Course!');
    }
  }

  async function handleEdit() {
    form.error = undefined;

    const result = schema
      .transform((val) => ({
        ...val,
        detail: [
          ...val.detail.compulsory.map((v) => ({ subjectId: v, type: 'compulsory' })),
          ...val.detail.elective.map((v) => ({ subjectId: v, type: 'elective' })),
        ],
      }))
      .safeParse(form.data);

    if (!result.success) {
      form.error = result.error;
      return;
    }

    const ret = await editCourse(result.data).catch((r: Response) => console.error(r));

    if (ret) {
      form.data = {
        id: '',
        name: '',
        detail: {
          compulsory: [],
          elective: [],
        },
      };

      await invalidate('data:course');

      callback();

      toast.success('Edit Complete!');
    } else {
      toast.error('Fail to Edit course!');
    }
  }

  onMount(() => {
    if (edit && editData) {
      form.data = editData;
    }
  });
</script>

<form on:submit|preventDefault="{() => handleSubmit()}" class="space-y-4">
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
        bind:value="{form.data.name}"
        bind:this="{firstInput}"
        use:blurOnEscape
      />
    </div>
    <div class="col-span-4 col-start-3 text-red-600">
      {form.error ? getZodErrorMessage(form.error, ['name']) : ''}
    </div>
  </section>
  <section id="input-compulsory" class="grid grid-cols-6">
    <div class="col-span-2 flex items-center">
      <label for="" class="font-semibold">
        Compulsory <span class="text-red-600">*</span>
      </label>
    </div>
    <div
      class="col-span-4"
      class:invalid="{form.error && getZodErrorMessage(form.error, ['compulsory']).length > 0}"
    >
      <Select
        options="{subjectOptions.filter((v) => !form.data.detail.elective.includes(v.value))}"
        bind:value="{form.data.detail.compulsory}"
        multiple
        placeholder="Select Subject"
      />
    </div>
    <div class="col-span-4 col-start-3 text-red-600">
      {form.error ? getZodErrorMessage(form.error, ['compulsory']) : ''}
    </div>
  </section>
  <section id="input-elective" class="grid grid-cols-6">
    <div class="col-span-2 flex items-center">
      <label for="" class="font-semibold">
        Elective <span class="text-red-600">*</span>
      </label>
    </div>
    <div
      class="col-span-4"
      class:invalid="{form.error && getZodErrorMessage(form.error, ['compulsory']).length > 0}"
    >
      <Select
        options="{subjectOptions.filter((v) => !form.data.detail.compulsory.includes(v.value))}"
        bind:value="{form.data.detail.elective}"
        multiple
        placeholder="Select Subject"
      />
    </div>
    <div class="col-span-4 col-start-3 text-red-600">
      {form.error ? getZodErrorMessage(form.error, ['elective']) : ''}
    </div>
  </section>

  <button type="submit" class="button w-full">Save</button>
</form>
