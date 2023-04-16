<script lang="ts">
  import type { PageData } from './$types';
  import { page } from '$app/stores';
  import { invalidate } from '$app/navigation';
  import { slide } from 'svelte/transition';
  import { blurOnEscape } from '$lib/utils/directives';
  import { deleteBuilding } from '$lib/api/building';
  import debounce from '$lib/utils/debounce';
  import Modal from '$lib/components/Modal.svelte';
  import Pagination from '$lib/components/Pagination.svelte';
  import Building from './BuildingForm.svelte';

  const handleSearch = debounce(async (text: string) => {
    const url = new URL(window.location.toString());
    url.searchParams.set('search', text);
    history.replaceState({}, '', url);
    await invalidate('data:building');
  }, 300);

  export let data: PageData;

  let newState = false;
  let editState = false;
  let editData: {
    id: string;
    code: string;
    name: string;
  };

  function showEdit(building: { id: string; code: string; name: string }) {
    editState = true;
    editData = building;
  }

  async function handleDelete(building: { id: string }) {
    if (confirm('Are you sure?')) {
      await deleteBuilding(building).catch((e: Response) => console.error(e));
      await invalidate('data:building');
    }
  }
</script>

<svelte:head>
  <title>Building</title>
</svelte:head>

<div class="flex flex-wrap items-center justify-between gap-4 p-4 md:flex-nowrap">
  <div class="inline-flex w-full items-center space-x-2 font-medium md:w-fit">
    <a class="text-primary" href="/">Home</a>
    <span>/</span>
    <span class="text-secondary">Building</span>
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
    New Building
  </button>
</div>

{#if newState}
  <div id="new" class="bg-light p-4" transition:slide>
    <h1 class="mb-4 block text-center text-2xl font-bold">New Building</h1>
    <div class="mx-auto max-w-screen-md rounded bg-white p-4 shadow">
      <Building />
    </div>
  </div>
{/if}

<Modal bind:open={editState}>
  <div id="edit" class="p-4">
    <h1 class="mb-4 block text-center text-2xl font-bold">Edit Building</h1>
    <Building edit={true} {editData} callback={() => (editState = false)} />
  </div>
</Modal>

<div id="records" class="overflow-x-auto">
  <table class="w-full">
    <thead>
      <tr>
        <th>Code</th>
        <th>Name</th>
        <th>Created</th>
        <th>Updated</th>
        <th>•••</th>
      </tr>
    </thead>
    <tbody>
      {#if data.building.total == 0}
        <tr>
          <td class="text-center text-secondary" colspan="5">No records found.</td>
        </tr>
      {/if}
      {#each data.building.data as building (building.id)}
        <tr class="hover:bg-light">
          <td class="text-center" width="10%">{building.code}</td>
          <td>{building.name}</td>
          <td class="fit-width whitespace-nowrap text-center text-sm">
            <p class="font-semibold">{new Date(building.createdAt).toLocaleDateString()}</p>
            <p class="text-dark">{new Date(building.createdAt).toLocaleTimeString()}</p>
            <p class="capitalize text-secondary">{building.createdBy.username}</p>
          </td>
          <td class="fit-width whitespace-nowrap text-center text-sm">
            <p class="font-semibold">{new Date(building.updatedAt).toLocaleDateString()}</p>
            <p class="text-dark">{new Date(building.updatedAt).toLocaleTimeString()}</p>
            <p class="capitalize text-secondary">{building.updatedBy.username}</p>
          </td>
          <td class="fit-width text-center">
            <div class="space-x-4 whitespace-nowrap">
              <button
                class="action-button text-blue-600"
                on:click={() => showEdit({ ...building })}
              >
                Edit
              </button>
              <button
                class="action-button text-red-600"
                on:click={() => handleDelete({ id: building.id })}
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
    total={Math.ceil(data.building.total / data.building.limit)}
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
