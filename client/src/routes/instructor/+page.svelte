<script lang="ts">
  import type { PageData } from './$types';
  import { page } from '$app/stores';
  import { invalidate } from '$app/navigation';
  import { slide } from 'svelte/transition';
  import { blurOnEscape } from '$lib/utils/directives';
  import { deleteInstructor } from '$lib/api/instructor';
  import debounce from '$lib/utils/debounce';
  import Modal from '$lib/components/Modal.svelte';
  import Pagination from '$lib/components/Pagination.svelte';
  import InstructorForm from './InstructorForm.svelte';

  const handleSearch = debounce(async (text: string) => {
    const url = new URL(window.location.toString());
    url.searchParams.set('search', text);
    history.replaceState({}, '', url);
    await invalidate('data:instructor');
  }, 300);

  export let data: PageData;

  let newState = false;
  let editState = false;
  let editData: {
    id: string;
    name: string;
  };

  function showEdit(instructor: { id: string; name: string }) {
    editState = true;
    editData = instructor;
  }

  async function handleDelete(instructor: { id: string }) {
    if (confirm('Are you sure?')) {
      await deleteInstructor(instructor).catch((e) => console.error(e));
      await invalidate('data:instructor');
    }
  }
</script>

<svelte:head>
  <title>Instructor</title>
</svelte:head>

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
      on:click={() => (newState = !newState)}
    >
      New Instructor
    </button>
  </div>

  {#if newState}
    <div id="instructor-new" class="border-y bg-slate-100 p-4" transition:slide>
      <h1 class="mb-4 block text-center text-2xl font-bold">New Instructor</h1>
      <div class="mx-auto max-w-screen-md rounded-md border bg-white">
        <InstructorForm />
      </div>
    </div>
  {/if}

  <Modal bind:open={editState} class="w-full max-w-screen-sm">
    <div id="instructor-edit">
      <h1 class="mb-4 block text-center text-2xl font-bold">Edit Instructor</h1>
      <InstructorForm edit={true} {editData} callback={() => (editState = false)} />
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
            <td class="px-4 py-2">{name}</td>
            <td class="px-6 py-2 text-center" style="width: 1%!important;">
              <span class="block whitespace-nowrap font-semibold text-slate-600">
                {new Date(createdAt).toLocaleDateString()}
              </span>
              <span class="block whitespace-nowrap text-slate-400">
                {new Date(createdAt).toLocaleTimeString()}
              </span>
            </td>
            <td class="px-6 py-2 text-center" style="width: 1%!important;">
              <span class="block whitespace-nowrap font-semibold text-slate-600">
                {new Date(updatedAt).toLocaleDateString()}
              </span>
              <span class="block whitespace-nowrap text-slate-400">
                {new Date(updatedAt).toLocaleTimeString()}
              </span>
            </td>
            <td class="px-6 py-2 text-center" style="width: 1%!important;">
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