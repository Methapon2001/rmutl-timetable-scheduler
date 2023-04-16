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
  import Instructor from './InstructorForm.svelte';

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
      await deleteInstructor(instructor).catch((e: Response) => console.error(e));
      await invalidate('data:instructor');
    }
  }
</script>

<svelte:head>
  <title>Instructor</title>
</svelte:head>

<div class="flex flex-wrap items-center justify-between gap-4 p-4 md:flex-nowrap">
  <div class="inline-flex w-full items-center space-x-2 font-medium md:w-fit">
    <a class="text-primary" href="/">Home</a>
    <span>/</span>
    <span class="text-secondary">Instructor</span>
  </div>

  <div class="w-full md:w-fit md:flex-grow md:px-16">
    <input
      name="search"
      type="text"
      class="search w-full"
      placeholder="Search"
      autocomplete="off"
      value={$page.url.searchParams.get('search')}
      on:input={(e) => handleSearch(e.currentTarget.value)}
      use:blurOnEscape
    />
  </div>

  <button type="button" class="button w-full md:w-fit" on:click={() => (newState = !newState)}>
    New Instructor
  </button>
</div>

{#if newState}
  <div id="new" class="bg-light p-4" transition:slide>
    <h1 class="mb-4 block text-center text-2xl font-bold">New Instructor</h1>
    <div class="mx-auto max-w-screen-md rounded bg-white p-4 shadow">
      <Instructor />
    </div>
  </div>
{/if}

<Modal bind:open={editState}>
  <div id="edit" class="p-4">
    <h1 class="mb-4 block text-center text-2xl font-bold">Edit Instructor</h1>
    <Instructor edit={true} {editData} callback={() => (editState = false)} />
  </div>
</Modal>

<div id="records" class="overflow-x-auto">
  <table class="w-full">
    <thead>
      <tr>
        <th>Name</th>
        <th>Created</th>
        <th>Updated</th>
        <th>•••</th>
      </tr>
    </thead>
    <tbody>
      {#if data.instructor.total == 0}
        <tr>
          <td class="text-center text-secondary" colspan="4">No records found.</td>
        </tr>
      {/if}
      {#each data.instructor.data as instructor (instructor.id)}
        <tr class="hover:bg-light">
          <td>{instructor.name}</td>
          <td class="fit-width whitespace-nowrap text-center text-sm">
            <p class="font-semibold">{new Date(instructor.createdAt).toLocaleDateString()}</p>
            <p class="text-dark">{new Date(instructor.createdAt).toLocaleTimeString()}</p>
            <p class="capitalize text-secondary">{instructor.createdBy.username}</p>
          </td>
          <td class="fit-width whitespace-nowrap text-center text-sm">
            <p class="font-semibold">{new Date(instructor.updatedAt).toLocaleDateString()}</p>
            <p class="text-dark">{new Date(instructor.updatedAt).toLocaleTimeString()}</p>
            <p class="capitalize text-secondary">{instructor.updatedBy.username}</p>
          </td>
          <td class="fit-width text-center">
            <div class="space-x-4 whitespace-nowrap">
              <button
                class="action-button text-blue-600"
                on:click={() => showEdit({ ...instructor })}
              >
                Edit
              </button>
              <button
                class="action-button text-red-600"
                on:click={() => handleDelete({ id: instructor.id })}
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

<div id="pagination">
  <Pagination
    current={+($page.url.searchParams.get('page') ?? 1)}
    range={3}
    total={Math.ceil(data.instructor.total / data.instructor.limit)}
  />
</div>

<style lang="postcss">
  tr {
    @apply border-b;
  }

  th {
    @apply p-4;
  }

  td {
    @apply px-4 py-2;
  }

  .action-button {
    @apply font-semibold outline-none;
  }

  .action-button:hover {
    @apply underline;
  }

  .fit-width {
    width: 1% !important;
  }
</style>
