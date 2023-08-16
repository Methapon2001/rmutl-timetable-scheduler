<script lang="ts">
  import { type ZodError, z } from 'zod';
  import { invalidate } from '$app/navigation';
  import { blurOnEscape } from '$lib/utils/directives';
  import { getZodErrorMessage } from '$lib/utils/zod';
  import { createInfo, editInfo } from '$lib/api/info';
  import { onMount } from 'svelte';
  import toast from 'svelte-french-toast';

  const schema = z.object({
    id: z.string().nonempty(),
    year: z.number(),
    semester: z.number(),
    current: z.boolean(),
  });

  const newSchema = schema.omit({
    id: true,
  });

  export let edit = false;
  export let editData: typeof form.data = {
    id: '',
    year: 0,
    semester: 0,
    current: false,
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
      year: 2565,
      semester: 1,
      current: false,
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

    const ret = await createInfo(result.data).catch((r: Response) => console.error(r));

    if (ret) {
      form.data = {
        id: '',
        year: 2656,
        semester: 1,
        current: false,
      };

      await invalidate('data:info');

      callback();

      firstInput.focus();

      toast.success('Info Created!');
    } else {
      toast.error('Fail to create Info!');
    }
  }

  async function handleEdit() {
    form.error = undefined;

    const result = schema.safeParse(form.data);

    if (!result.success) {
      form.error = result.error;
      return;
    }

    const ret = await editInfo(result.data).catch((r: Response) => console.error(r));

    if (ret) {
      form.data = {
        id: '',
        year: 0,
        semester: 0,
        current: false,
      };

      await invalidate('data:info');

      callback();

      toast.success('Edit Complete!');
    } else {
      toast.error('Fail to Edit Info!');
    }
  }

  onMount(() => {
    if (edit && editData) {
      form.data = editData;
    }
  });
</script>

<form on:submit|preventDefault="{() => handleSubmit()}" class="space-y-4">
  <section id="input-year" class="grid grid-cols-6">
    <div class="col-span-2 flex items-center">
      <label for="" class="font-semibold">
        Year <span class="text-red-600">*</span>
      </label>
    </div>
    <div class="col-span-4">
      <input
        type="number"
        placeholder="Info Code"
        class="input text-center
          {form.error && getZodErrorMessage(form.error, ['year']).length > 0
          ? 'border border-red-600'
          : ''}"
        bind:value="{form.data.year}"
        bind:this="{firstInput}"
        use:blurOnEscape
      />
    </div>
    <div class="col-span-4 col-start-3 text-red-600">
      {form.error ? getZodErrorMessage(form.error, ['year']) : ''}
    </div>
  </section>

  <section id="input-semester" class="grid grid-cols-6">
    <div class="col-span-2 flex items-center">
      <label for="" class="font-semibold">
        Semester <span class="text-red-600">*</span>
      </label>
    </div>
    <div class="col-span-4">
      <input
        type="number"
        placeholder="Info Semester"
        max=3
        class="input text-center
          {form.error && getZodErrorMessage(form.error, ['semester']).length > 0
          ? 'border border-red-600'
          : ''}"
        bind:value="{form.data.semester}"
        use:blurOnEscape
      />
    </div>
    <div class="col-span-4 col-start-3 text-red-600">
      {form.error ? getZodErrorMessage(form.error, ['semester']) : ''}
    </div>
  </section>

  <button type="submit" class="button w-full">Save</button>
</form>
