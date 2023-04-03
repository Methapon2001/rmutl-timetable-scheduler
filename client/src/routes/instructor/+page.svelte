<script lang="ts">
  import type { PageData } from './$types';
  import z, { ZodType } from 'zod';
  import { page } from '$app/stores';
  import { invalidate } from '$app/navigation';
  import { slide } from 'svelte/transition';
  import { blurOnEscape } from '$lib/utils/directives';
  import { createInstructor, deleteInstructor, editInstructor } from '$lib/api/instructor';
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
    await invalidate('data:instructor');
  }, 300);

  const newSchema = z.object({
    name: z.string().min(3),
  });

  const editSchema = newSchema.extend({
    id: z.string().nonempty().uuid(),
  });

  export let data: PageData;

  let newInstructorState = false;
  let editInstructorState = false;

  let newForm: Form<typeof newSchema> = {
    data: {
      name: '',
    },
    error: null,
  };

  let editForm: Form<typeof editSchema> = {
    data: {
      id: '',
      name: '',
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

    const ret = await createInstructor(result.data).catch((r: Response) => console.error(r));

    if (ret) {
      newForm.data = {
        name: '',
      };

      await invalidate('data:instructor');
    }
  }

  async function handleEdit() {
    editForm.error = null;

    const result = editSchema.safeParse(editForm.data);

    if (!result.success) {
      editForm.error = result.error.format();
      return;
    }

    const ret = await editInstructor(result.data).catch((r: Response) => console.error(r));

    if (ret) {
      editInstructorState = false;

      editForm.data = {
        id: '',
        name: '',
      };

      await invalidate('data:instructor');
    }
  }

  // eslint-disable no-undef
  function showEdit(instructor: Pick<API.Instructor, 'id' | 'name'>) {
    editInstructorState = true;

    editForm.data = instructor;
    editForm.error = null;
  }

  async function handleDelete(instructor: Pick<API.Instructor, 'id'>) {
    if (confirm('Are you sure?')) {
      await deleteInstructor(instructor).catch((e) => console.error(e));
      invalidate('data:instructor');
    }
  }
  // eslint-enable no-undef
</script>

<div>
  <div class="flex flex-wrap items-center justify-between gap-4 p-4 md:flex-nowrap">
    <div
      class="inline-flex w-full items-center space-x-2 text-sm font-medium text-slate-600 md:w-fit md:text-base"
    >
      <a href="/">Home</a>
      <span>/</span>
      <span class="text-slate-300">Instructor</span>
    </div>

    <div class="w-full md:w-fit md:flex-grow md:px-16">
      <input
        id="instructor-search"
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
      on:click={() => (newInstructorState = !newInstructorState)}
    >
      New Instructor
    </button>
  </div>

  {#if newInstructorState}
    <div id="instructor-new" class="border-y bg-slate-100 p-4" transition:slide>
      <h1 class="mb-4 block text-center text-2xl font-bold">New Instructor</h1>
      <form
        on:submit|preventDefault={() => handleCreate()}
        class="mx-auto grid max-w-screen-sm grid-cols-4 gap-2 rounded-md border bg-white p-4"
      >
        <!-- Input name -->
        <div class="col-span-1 flex items-center text-left font-semibold">
          <label class="w-full" for="instructor-name">
            Name <span class="text-red-600">*</span>
          </label>
        </div>
        <div class="col-span-3">
          <input
            id="instructor-name"
            name="instructor-name"
            autocomplete="off"
            type="text"
            class="w-full rounded-t-md border-b-2 px-4 py-2 outline-none transition duration-150 focus:bg-slate-100
            {newForm.error?.name?._errors ? 'border-b-red-600' : 'focus:border-b-slate-900'}"
            bind:value={newForm.data.name}
            use:blurOnEscape
          />
        </div>
        <!-- End input name -->
        <!-- Error input name -->
        <div class="col-span-3 col-start-2 flex flex-col">
          {#if newForm.error?.name?._errors}
            <small transition:slide class="font-semibold text-red-600">
              {newForm.error.name._errors}
            </small>
          {/if}
        </div>
        <!-- End error input name -->
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

  <Modal bind:open={editInstructorState} class="w-full max-w-screen-sm">
    <div id="instructor-edit">
      <h1 class="mb-4 block text-center text-2xl font-bold">Edit Instructor</h1>
      <form
        on:submit|preventDefault={() => handleEdit()}
        class="mx-auto grid grid-cols-4 gap-2 p-4"
      >
        <div class="col-span-1 flex items-center text-left font-semibold">
          <label class="w-full" for="instructor-name">Name</label>
        </div>
        <div class="col-span-3">
          <input
            id="instructor-name"
            name="instructor-name"
            autocomplete="off"
            type="text"
            class="w-full rounded-t-md border-b-2 px-4 py-2 outline-none transition duration-150 focus:bg-slate-100 {editForm
              .error?.name?._errors
              ? 'border-b-red-600'
              : 'focus:border-b-slate-900'}"
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

  <div id="instructor-records" class="w-full overflow-x-auto">
    <table class="w-full">
      <thead class="sticky top-0">
        <tr class="border-b font-extrabold">
          <th class="p-4">Name</th>
          <th class="p-4">Created</th>
          <th class="p-4">Updated</th>
          <th class="p-4 text-center">•••</th>
        </tr>
      </thead>
      <tbody>
        {#if data.instructor.total == 0}
          <tr>
            <td class="border-b px-4 py-2 text-center text-slate-600" colspan="4"
              >No records found.</td
            >
          </tr>
        {/if}
        {#each data.instructor.data as { id, name, createdAt, updatedAt } (id)}
          <tr class="border-b text-sm hover:bg-slate-100">
            <td class="px-4 py-2" width="40%">{name}</td>
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
                  on:click={() => showEdit({ id, name })}
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
    <div id="instructor-pagination">
      <Pagination
        current={+($page.url.searchParams.get('page') ?? 1)}
        range={3}
        total={Math.ceil(data.instructor.total / data.instructor.limit)}
      />
    </div>
  {/if}
</div>
