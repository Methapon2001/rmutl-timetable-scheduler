<script lang="ts">
  import { type ZodError, z } from 'zod';
  import { invalidate } from '$app/navigation';
  import { blurOnEscape } from '$lib/utils/directives';
  import { getZodErrorMessage } from '$lib/utils/zod';
  import { createBuilding, editBuilding } from '$lib/api/building';
  import { onMount } from 'svelte';
  import toast from 'svelte-french-toast';

  const schema = z.object({
    id: z.string().nonempty(),
    code: z.string().min(1),
    name: z.string().min(3),
  });

  const newSchema = schema.omit({
    id: true,
  });

  export let edit = false;
  export let editData: typeof form.data = {
    id: '',
    code: '',
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
      code: '',
      name: '',
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

    const ret = await createBuilding(result.data).catch((r: Response) => console.error(r));

    if (ret) {
      form.data = {
        id: '',
        code: '',
        name: '',
      };

      await invalidate('data:building');

      callback();

      firstInput.focus();

      toast.success('Building Created!');
    } else {
      toast.error('Fail to create building!');
    }
  }

  async function handleEdit() {
    form.error = undefined;

    const result = schema.safeParse(form.data);

    if (!result.success) {
      form.error = result.error;
      return;
    }

    const ret = await editBuilding(result.data).catch((r: Response) => console.error(r));

    if (ret) {
      form.data = {
        id: '',
        code: '',
        name: '',
      };

      await invalidate('data:building');

      callback();

      toast.success('Edit Complete!');
    } else {
      toast.error('Fail to Edit building!');
    }
  }

  onMount(() => {
    if (edit && editData) {
      form.data = editData;
    }
  });
</script>

<form on:submit|preventDefault="{() => handleSubmit()}" class="space-y-4">
  <section id="input-code" class="grid grid-cols-6">
    <div class="col-span-2 flex items-center">
      <label for="" class="font-semibold">
        Code <span class="text-red-600">*</span>
      </label>
    </div>
    <div class="col-span-4">
      <input
        type="text"
        class="input text-center
        {form.error && getZodErrorMessage(form.error, ['code']).length > 0
          ? 'border border-red-600'
          : ''}"
        bind:value="{form.data.code}"
        bind:this="{firstInput}"
        use:blurOnEscape
      />
    </div>
    <div class="col-span-4 col-start-3 text-red-600">
      {form.error ? getZodErrorMessage(form.error, ['code']) : ''}
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
