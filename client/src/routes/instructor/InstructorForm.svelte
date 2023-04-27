<script lang="ts">
  import { type ZodError, z } from 'zod';
  import { invalidate } from '$app/navigation';
  import { blurOnEscape } from '$lib/utils/directives';
  import { getZodErrorMessage } from '$lib/utils/zod';
  import { createInstructor, editInstructor } from '$lib/api/instructor';
  import { onMount } from 'svelte';
  import toast from 'svelte-french-toast';

  const schema = z.object({
    id: z.string().nonempty(),
    name: z.string().min(3),
  });

  const newSchema = schema.omit({
    id: true,
  });

  export let edit = false;
  export let editData: typeof form.data = {
    id: '',
    name: '',
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
    },
    error: undefined,
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

    const ret = await createInstructor(result.data).catch((r: Response) => console.error(r));

    if (ret) {
      form.data = {
        id: '',
        name: '',
      };

      await invalidate('data:instructor');

      callback();

      toast.success('Instructor Created!');
    } else {
      toast.error('Fail to create Instructor!');
    }
  }

  async function handleEdit() {
    form.error = undefined;

    const result = schema.safeParse(form.data);

    if (!result.success) {
      form.error = result.error;
      return;
    }

    const ret = await editInstructor(result.data).catch((r: Response) => console.error(r));

    if (ret) {
      form.data = {
        id: '',
        name: '',
      };

      await invalidate('data:instructor');

      callback();

      toast.success('Edit Complete!');
    } else {
      toast.error('Fail to Edit Instructor!');
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
        class="input text-center
        {form.error && getZodErrorMessage(form.error, ['name']).length > 0
          ? 'border border-red-600'
          : ''}"
        bind:value="{form.data.name}"
        use:blurOnEscape
      />
    </div>
    <div class="col-span-4 col-start-3 text-red-600">
      {form.error ? getZodErrorMessage(form.error, ['name']) : ''}
    </div>
  </section>

  <button type="submit" class="button w-full">Save</button>
</form>
