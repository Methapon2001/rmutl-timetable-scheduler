<script lang="ts">
  import type { PageData } from './$types';
  import z, { ZodType } from 'zod';
  import { page } from '$app/stores';
  import { invalidate } from '$app/navigation';
  import { slide } from 'svelte/transition';
  import { blurOnEscape } from '$lib/utils/directives';
  import { createBuilding, deleteBuilding, editBuilding } from '$lib/api/building';
  import debounce from '$lib/utils/debounce';
  import Modal from '$lib/components/Modal.svelte';
  import Pagination from '$lib/components/Pagination.svelte';

  type Form<T extends ZodType> = {
    data: z.infer<T>;
    error: z.inferFormattedError<T> | null;
  };

  const handleSearch = debounce(async (text: string) => {
    const url = new URL(window.location.toString());
    url.searchParams.set('search', text);
    history.replaceState({}, '', url);
    await invalidate('data:building');
  }, 300);

  const schema = z.object({
    id: z.string().nonempty().uuid(),
    code: z.string().min(3).toUpperCase(),
    name: z.string().min(3),
  });

  const newSchema = schema.omit({
    id: true,
  });

  export let data: PageData;

  let newBuildingState = false;
  let editBuildingState = false;

  let newForm: Form<typeof newSchema> = {
    data: {
      name: '',
      code: '',
    },
    error: null,
  };

  let editForm: Form<typeof schema> = {
    data: {
      id: '',
      name: '',
      code: '',
    },
    error: null,
  };

  async function handleCreate() {
    newForm.error = null;

    const result = newSchema.safeParse(newForm.data);

    if (!result.success) {
      newForm.error = result.error.format();
      return;
    }

    const ret = await createBuilding(result.data).catch((r: Response) => console.error(r));

    if (ret) {
      newForm.data = {
        name: '',
        code: '',
      };

      await invalidate('data:building');
    }
  }

  async function handleEdit() {
    editForm.error = null;

    const result = schema.safeParse(editForm.data);

    if (!result.success) {
      editForm.error = result.error.format();
      return;
    }

    const ret = await editBuilding(result.data).catch((r: Response) => console.error(r));

    if (ret) {
      editBuildingState = false;

      editForm.data = {
        id: '',
        name: '',
        code: '',
      };

      await invalidate('data:building');
    }
  }

  function showEdit(building: z.infer<typeof schema>) {
    editBuildingState = true;

    editForm.data = building;
    editForm.error = null;
  }

  async function handleDelete(building: Pick<z.infer<typeof schema>, 'id'>) {
    if (confirm('Are you sure?')) {
      await deleteBuilding(building).catch((e) => console.error(e));
      await invalidate('data:building');
    }
  }
</script>

<svelte:head>
  <title>Building</title>
</svelte:head>

<div>
  <div class="flex flex-wrap items-center justify-between gap-4 p-4 md:flex-nowrap">
    <div
      class="inline-flex w-full items-center space-x-2 text-sm font-medium text-slate-600 md:w-fit md:text-base"
    >
      <a href="/">Home</a>
      <span>/</span>
      <span class="text-slate-300">Building</span>
    </div>

    <div class="w-full md:w-fit md:flex-grow md:px-16">
      <input
        id="building-search"
        name="search"
        type="text"
        class="w-full rounded-md bg-slate-100 px-4 py-2 outline-none transition duration-150 focus:bg-slate-200"
        placeholder="Search"
        autocomplete="off"
        value={$page.url.searchParams.get('search')}
        on:input={(e) => handleSearch(e.currentTarget.value)}
        use:blurOnEscape
      />
    </div>

    <button
      type="button"
      class="w-full cursor-pointer whitespace-nowrap rounded border border-slate-900 bg-slate-900 px-4 py-2 font-semibold text-slate-100 outline-none transition duration-150 hover:bg-slate-800 focus:ring focus:ring-slate-400/70 disabled:cursor-default disabled:border-slate-600 disabled:bg-slate-600 md:w-fit"
      on:click={() => (newBuildingState = !newBuildingState)}
    >
      New Building
    </button>
  </div>

  {#if newBuildingState}
    <div id="building-new" class="border-y bg-slate-100 p-4" transition:slide>
      <h1 class="mb-4 block text-center text-2xl font-bold">New Building</h1>
      <form
        on:submit|preventDefault={() => handleCreate()}
        class="mx-auto grid max-w-screen-sm grid-cols-4 gap-2 rounded-md border bg-white p-4"
      >
        <!-- Input code -->
        <div class="col-span-1 flex items-center text-left font-semibold">
          <label class="w-full" for="building-name">Code <span class="text-red-600">*</span></label>
        </div>
        <div class="col-span-3">
          <input
            id="building-code"
            name="building-code"
            autocomplete="off"
            type="text"
            class="w-full rounded-t-md border-b-2 px-4 py-2 outline-none uppercase transition duration-150 focus:bg-slate-100
            {newForm.error?.code?._errors ? 'border-b-red-600' : 'focus:border-b-slate-900'}"
            bind:value={newForm.data.code}
            use:blurOnEscape
          />
        </div>
        <!-- End input code -->
        <!-- Error input code -->
        <div class="col-span-3 col-start-2 flex flex-col">
          {#if newForm.error?.code?._errors}
            <small transition:slide class="font-semibold text-red-600">
              {newForm.error.code._errors}
            </small>
          {/if}
        </div>
        <!-- End error input code -->
        <div class="col-span-1 flex items-center text-left font-semibold">
          <label class="w-full" for="building-name">Name <span class="text-red-600">*</span></label>
        </div>
        <div class="col-span-3">
          <input
            id="building-name"
            name="building-name"
            autocomplete="off"
            type="text"
            class="w-full rounded-t-md border-b-2 px-4 py-2 outline-none transition duration-150 focus:bg-slate-100
            {newForm.error?.name?._errors ? 'border-b-red-600' : 'focus:border-b-slate-900'}"
            bind:value={newForm.data.name}
            use:blurOnEscape
          />
        </div>
        <div class="col-span-3 col-start-2 flex flex-col">
          {#if newForm.error && newForm.error.name?._errors}
            <small transition:slide class="font-semibold text-red-600">
              {newForm.error.name._errors}
            </small>
          {/if}
        </div>
        <div class="col-span-4">
          <button
            type="submit"
            class="w-full cursor-pointer whitespace-nowrap rounded border border-slate-900 bg-slate-900 px-4 py-2 font-semibold text-slate-100 outline-none transition duration-150 hover:bg-slate-800 focus:ring focus:ring-slate-400/70 disabled:cursor-default disabled:border-slate-600 disabled:bg-slate-600"
          >
            Save
          </button>
        </div>
      </form>
    </div>
  {/if}

  <Modal bind:open={editBuildingState} class="w-full max-w-screen-sm">
    <div id="building-edit">
      <h1 class="mb-4 block text-center text-2xl font-bold">Edit Building</h1>
      <form
        on:submit|preventDefault={() => handleEdit()}
        class="mx-auto grid grid-cols-4 gap-2 p-4"
      >
        <div class="col-span-1 flex items-center text-left font-semibold">
          <label class="w-full" for="building-name">Code <span class="text-red-600">*</span></label>
        </div>
        <div class="col-span-3">
          <input
            id="building-code"
            name="building-code"
            autocomplete="off"
            type="text"
            class="w-full rounded-t-md border-b-2 px-4 py-2 uppercase outline-none transition duration-150 focus:bg-slate-100
            {editForm.error?.code?._errors ? 'border-b-red-600' : 'focus:border-b-slate-900'}"
            bind:value={editForm.data.code}
            use:blurOnEscape
          />
        </div>
        <div class="col-span-3 col-start-2 flex flex-col">
          {#if editForm.error && editForm.error.code?._errors}
            <small transition:slide class="font-semibold text-red-600">
              {editForm.error.code._errors}
            </small>
          {/if}
        </div>
        <div class="col-span-1 flex items-center text-left font-semibold">
          <label class="w-full" for="building-name">Name</label>
        </div>
        <div class="col-span-3">
          <input
            id="building-name"
            name="building-name"
            autocomplete="off"
            type="text"
            class="w-full rounded-t-md border-b-2 px-4 py-2 outline-none transition duration-150 focus:bg-slate-100
            {editForm.error?.name?._errors ? 'border-b-red-600' : 'focus:border-b-slate-900'}"
            bind:value={editForm.data.name}
            use:blurOnEscape
          />
        </div>
        <div class="col-span-3 col-start-2 flex flex-col">
          {#if editForm.error?.name?._errors}
            <small transition:slide class="font-semibold text-red-600">
              {editForm.error.name._errors}
            </small>
          {/if}
        </div>
        <div class="col-span-4">
          <button
            type="submit"
            class="w-full cursor-pointer whitespace-nowrap rounded border border-slate-900 bg-slate-900 px-4 py-2 font-semibold text-slate-100 outline-none transition duration-150 hover:bg-slate-800 focus:ring focus:ring-slate-400/70 disabled:cursor-default disabled:border-slate-600 disabled:bg-slate-600"
          >
            Save
          </button>
        </div>
      </form>
    </div>
  </Modal>

  <div id="building-records" class="w-full overflow-x-auto">
    <table class="w-full">
      <thead class="sticky top-0">
        <tr class="border-b font-extrabold">
          <th class="p-4">Code</th>
          <th class="p-4">Name</th>
          <th class="p-4">Created</th>
          <th class="p-4">Updated</th>
          <th class="p-4 text-center">•••</th>
        </tr>
      </thead>
      <tbody>
        {#if data.building.total == 0}
          <tr>
            <td class="border-b px-4 py-2 text-center text-slate-600" colspan="4"
              >No records found.</td
            >
          </tr>
        {/if}
        {#each data.building.data as { id, name, code, createdAt, updatedAt } (id)}
          <tr class="border-b text-sm hover:bg-slate-100">
            <td class="px-4 py-2 text-center" width="20%">{code}</td>
            <td class="px-4 py-2" width="30%">{name}</td>
            <td class="px-4 py-2 text-center">
              <span class="block font-semibold text-slate-600">
                {new Date(createdAt).toLocaleDateString()}
              </span>
              <span class="block text-slate-400">
                {new Date(createdAt).toLocaleTimeString()}
              </span>
            </td>
            <td class="px-4 py-2 text-center">
              <span class="block font-semibold text-slate-600">
                {new Date(updatedAt).toLocaleDateString()}
              </span>
              <span class="block text-slate-400">
                {new Date(updatedAt).toLocaleTimeString()}
              </span>
            </td>
            <td class="px-4 py-2 text-center">
              <div class="space-x-4 whitespace-nowrap">
                <button
                  class="font-semibold text-blue-600 outline-none hover:underline"
                  on:click={() => showEdit({ id, name, code })}
                >
                  Edit
                </button>
                <button
                  class="font-semibold text-red-600 outline-none hover:underline"
                  on:click={() => handleDelete({ id })}
                >
                  Delete
                </button>
              </div>
            </td>
          </tr>
        {/each}
      </tbody>
    </table>
  </div>

  {#if !$page.url.searchParams.has('search') || $page.url.searchParams.get('search')?.length == 0}
    <div id="building-pagination">
      <Pagination
        current={+($page.url.searchParams.get('page') ?? 1)}
        range={3}
        total={Math.ceil(data.building.total / data.building.limit)}
      />
    </div>
  {/if}
</div>
