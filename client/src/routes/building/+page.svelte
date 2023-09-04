<script lang="ts">
  import type { PageData } from './$types';
  import type { Building } from '$lib/types';
  import { page } from '$app/stores';
  import toast from 'svelte-french-toast';

  import { invalidate } from '$app/navigation';
  import { blurOnEscape } from '$lib/utils/directives';
  import { searchHandler } from '$lib/utils/search';
  import apiRequest from '$lib/api';

  import Modal from '$lib/components/Modal.svelte';
  import Pagination from '$lib/components/Pagination.svelte';
  import Form from './BuildingForm.svelte';

  const search = searchHandler('data:building');

  export let data: PageData;

  let newState = false;
  let editState = false;

  let currentData: Building;

  function triggerEdit(building: typeof currentData) {
    currentData = building;
    editState = true;
  }

  async function handleDelete(id: string) {
    const flag = confirm('Are you sure? This action cannot be undone.');

    if (!flag) return;

    const ret = await apiRequest('/api/building')
      .delete({ id })
      .catch((e) => console.error(e));

    if (!ret)
      return toast.error(
        'Failed to delete building!\nThis record may currenly in use. \nSee console for more info.',
      );

    await invalidate('data:building');
    toast.success('Delete Complete!');
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
      value="{$page.url.searchParams.get('search')}"
      on:input="{(e) => search(e.currentTarget.value)}"
      use:blurOnEscape
    />
  </div>

  <button type="button" class="button w-full md:w-fit" on:click="{() => (newState = !newState)}">
    New Building
  </button>
</div>

{#if newState}
  <div id="new" class="bg-light p-4">
    <h1 class="mb-4 block text-center text-2xl font-bold">New Building</h1>
    <div class="mx-auto max-w-screen-md rounded bg-white p-4 shadow">
      <Form />
    </div>
  </div>
{/if}

<Modal bind:open="{editState}">
  <div id="edit" class="p-4">
    <h1 class="mb-4 block text-center text-2xl font-bold">Edit Building</h1>
    <Form edit="{true}" {...currentData} callback="{() => (editState = false)}" />
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
              <button class="action-button text-blue-600" on:click="{() => triggerEdit(building)}">
                Edit
              </button>
              <button
                class="action-button text-red-600"
                on:click="{() => handleDelete(building.id)}"
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
    current="{+($page.url.searchParams.get('page') ?? 1)}"
    range="{3}"
    total="{Math.ceil(data.building.total / data.building.limit)}"
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
