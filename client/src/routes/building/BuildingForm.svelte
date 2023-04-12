<script lang="ts">
  import { type ZodError, z } from 'zod';
  import { invalidate } from '$app/navigation';
  import { blurOnEscape } from '$lib/utils/directives';
  import { getZodErrorMessage } from '$lib/utils/zod';
  import { createBuilding, editBuilding } from '$lib/api/building';
  import FormInput from '$lib/components/FormInput.svelte';
  import { onMount } from 'svelte';

  const schema = z.object({
    id: z.string().nonempty(),
    code: z.string().min(1),
    name: z.string().min(3),
  });

  const newSchema = schema.omit({
    id: true,
  });

  export let edit: boolean = false;
  export let editData: typeof editForm.data = {
    id: '',
    code: '',
    name: '',
  };
  export let callback: Function = () => {};

  onMount(() => {
    if (edit && editData) {
      editForm.data = editData;
    }
  });

  let newForm: {
    data: z.infer<typeof newSchema>;
    error: ZodError | undefined;
  } = {
    data: {
      code: '',
      name: '',
    },
    error: undefined,
  };

  let editForm: {
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

  async function handleCreate() {
    newForm.error = undefined;

    const result = newSchema.safeParse(newForm.data);

    if (!result.success) {
      newForm.error = result.error;
      return;
    }

    const ret = await createBuilding(result.data).catch((r: Response) => console.error(r));

    if (ret) {
      newForm.data = {
        code: '',
        name: '',
      };

      await invalidate('data:building');

      callback();
    }
  }

  async function handleEdit() {
    editForm.error = undefined;

    const result = schema.safeParse(editForm.data);

    if (!result.success) {
      editForm.error = result.error;
      return;
    }

    const ret = await editBuilding(result.data).catch((r: Response) => console.error(r));

    if (ret) {
      editForm.data = {
        id: '',
        code: '',
        name: '',
      };

      await invalidate('data:building');

      callback();
    }
  }
</script>

{#if !edit}
  <form on:submit|preventDefault={() => handleCreate()} class="space-y-4 p-4">
    <FormInput
      label="Code"
      error={newForm.error ? getZodErrorMessage(newForm.error, ['code']).toString() : ''}
      required
    >
      <input
        slot="input"
        type="text"
        class="w-full rounded-t-md border-b-2 px-4 py-2 outline-none transition duration-150 focus:bg-slate-100
        {newForm.error && getZodErrorMessage(newForm.error, ['code'])
          ? 'border-b-red-600'
          : 'focus:border-b-slate-900'}"
        bind:value={newForm.data.code}
        use:blurOnEscape
      />
    </FormInput>
    <FormInput
      label="Name"
      error={newForm.error ? getZodErrorMessage(newForm.error, ['name']).toString() : ''}
      required
    >
      <input
        slot="input"
        type="text"
        class="w-full rounded-t-md border-b-2 px-4 py-2 outline-none transition duration-150 focus:bg-slate-100
        {newForm.error && getZodErrorMessage(newForm.error, ['name'])
          ? 'border-b-red-600'
          : 'focus:border-b-slate-900'}"
        bind:value={newForm.data.name}
        use:blurOnEscape
      />
    </FormInput>
    <button
      type="submit"
      class="w-full cursor-pointer whitespace-nowrap rounded border border-slate-900 bg-slate-900 px-4 py-2 font-semibold text-slate-100 outline-none transition duration-150 hover:bg-slate-800 focus:ring focus:ring-slate-400/70 disabled:cursor-default disabled:border-slate-600 disabled:bg-slate-600"
    >
      Save
    </button>
  </form>
{:else}
  <form on:submit|preventDefault={() => handleEdit()} class="space-y-4 p-4">
    <FormInput
      label="Code"
      error={editForm.error ? getZodErrorMessage(editForm.error, ['code']).toString() : ''}
      required
    >
      <input
        slot="input"
        type="text"
        class="w-full rounded-t-md border-b-2 px-4 py-2 outline-none transition duration-150 focus:bg-slate-100
        {editForm.error && getZodErrorMessage(editForm.error, ['code'])
          ? 'border-b-red-600'
          : 'focus:border-b-slate-900'}"
        bind:value={editForm.data.code}
        use:blurOnEscape
      />
    </FormInput>
    <FormInput
      label="Name"
      error={editForm.error ? getZodErrorMessage(editForm.error, ['name']).toString() : ''}
      required
    >
      <input
        slot="input"
        type="text"
        class="w-full rounded-t-md border-b-2 px-4 py-2 outline-none transition duration-150 focus:bg-slate-100
        {editForm.error && getZodErrorMessage(editForm.error, ['name'])
          ? 'border-b-red-600'
          : 'focus:border-b-slate-900'}"
        bind:value={editForm.data.name}
        use:blurOnEscape
      />
    </FormInput>
    <button
      type="submit"
      class="w-full cursor-pointer whitespace-nowrap rounded border border-slate-900 bg-slate-900 px-4 py-2 font-semibold text-slate-100 outline-none transition duration-150 hover:bg-slate-800 focus:ring focus:ring-slate-400/70 disabled:cursor-default disabled:border-slate-600 disabled:bg-slate-600"
    >
      Save
    </button>
  </form>
{/if}
