<script lang="ts">
  import { type ZodError, z } from 'zod';
  import { invalidate } from '$app/navigation';
  import { blurOnEscape } from '$lib/utils/directives';
  import { getZodErrorMessage } from '$lib/utils/zod';
  import { createGroup, editGroup } from '$lib/api/group';
  import { onMount } from 'svelte';
  import Select from '$lib/components/Select.svelte';
  import toast from 'svelte-french-toast';

  const schema = z.object({
    id: z.string().nonempty(),
    name: z.string().min(3),
    courseId: z.string().nonempty({ message: 'Must select one of the options.' }),
    planId: z.string().nonempty({ message: 'Must select one of the options.' }),
  });

  const newSchema = schema.omit({
    id: true,
  });

  export let courseOptions: {
    label: string;
    value: string;
    disabled?: boolean;
  }[];

  export let planOptions: {
    label: string;
    value: string;
    disabled?: boolean;
  }[];

  export let edit = false;
  export let editData: typeof form.data = {
    id: '',
    name: '',
    courseId: '',
    planId: '',
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
      planId: '',
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

    const ret = await createGroup(result.data).catch((r: Response) => console.error(r));

    if (ret) {
      form.data = {
        id: '',
        name: '',
        courseId: '',
        planId: '',
      };

      await invalidate('data:group');

      callback();

      firstInput.focus();

      toast.success('Group Created!');
    } else {
      toast.error('Fail to create Group!');
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
        planId: '',
      };

      await invalidate('data:group');

      callback();

      toast.success('Edit Complete!');
    } else {
      toast.error('Fail to Edit group!');
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
        placeholder="Group Name"
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
  <section id="input-course" class="grid grid-cols-6">
    <div class="col-span-2 flex items-center">
      <label for="" class="font-semibold">
        Course <span class="text-red-600">*</span>
      </label>
    </div>
    <div
      class="col-span-4"
      class:invalid="{form.error && getZodErrorMessage(form.error, ['courseId']).length > 0}"
    >
      <Select
        options="{courseOptions}"
        bind:value="{form.data.courseId}"
        placeholder="Select Course"
      />
    </div>
    <div class="col-span-4 col-start-3 text-red-600">
      {form.error ? getZodErrorMessage(form.error, ['courseId']) : ''}
    </div>
  </section>
  <section id="input-plan" class="grid grid-cols-6">
    <div class="col-span-2 flex items-center">
      <label for="" class="font-semibold">
        Plan <span class="text-red-600">*</span>
      </label>
    </div>
    <div
      class="col-span-4"
      class:invalid="{form.error && getZodErrorMessage(form.error, ['planId']).length > 0}"
    >
      <Select options="{planOptions}" bind:value="{form.data.planId}" placeholder="Select Plan" />
    </div>
    <div class="col-span-4 col-start-3 text-red-600">
      {form.error ? getZodErrorMessage(form.error, ['planId']) : ''}
    </div>
  </section>
  <button type="submit" class="button w-full">Save</button>
</form>
