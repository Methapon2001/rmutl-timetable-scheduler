<script lang="ts">
  import type { PageData } from './$types';
  import { page } from '$app/stores';
  import { invalidate } from '$app/navigation';
  import { blurOnEscape } from '$lib/utils/directives';
  import { deleteRoom } from '$lib/api/room';
  import debounce from '$lib/utils/debounce';
  import Modal from '$lib/components/Modal.svelte';
  import Pagination from '$lib/components/Pagination.svelte';
  import RoomForm from './RoomForm.svelte';

  const handleSearch = debounce(async (text: string) => {
    const url = new URL(window.location.toString());
    url.searchParams.set('search', text);
    history.replaceState({}, '', url);
    await invalidate('data:room');
  }, 300);

  const buildingOptions = async () => {
    return (await data.lazy.building).data.map((building) => ({
      label: building.name,
      value: building.id,
    }));
  };

  export let data: PageData;

  let newState = false;
  let editState = false;
  let editData: {
    id: string;
    name: string;
    type: string;
    buildingId: string;
  };

  function showEdit(room: { id: string; name: string; type: string; buildingId: string }) {
    editState = true;
    editData = room;
  }

  async function handleDelete(room: { id: string }) {
    if (confirm('Are you sure?')) {
      await deleteRoom(room).catch((e: Response) => console.error(e));
      await invalidate('data:room');
    }
  }
</script>

<svelte:head>
  <title>Room</title>
</svelte:head>

<div class="flex flex-wrap items-center justify-between gap-4 p-4 md:flex-nowrap">
  <div class="inline-flex w-full items-center space-x-2 font-medium md:w-fit">
    <a class="text-primary" href="/">Home</a>
    <span>/</span>
    <span class="text-secondary">Room</span>
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
    New Room
  </button>
</div>

{#if newState}
  <div id="new" class="bg-light p-4">
    <h1 class="mb-4 block text-center text-2xl font-bold">New Room</h1>
    <div class="mx-auto max-w-screen-md rounded bg-white p-4 shadow">
      {#await buildingOptions()}
        Loading...
      {:then options}
        <RoomForm buildingOptions={options} />
      {/await}
    </div>
  </div>
{/if}

<Modal bind:open={editState}>
  <div id="edit" class="p-4">
    <h1 class="mb-4 block text-center text-2xl font-bold">Edit Room</h1>
    {#await buildingOptions()}
      Loading...
    {:then options}
      <RoomForm
        buildingOptions={options}
        edit={true}
        {editData}
        callback={() => (editState = false)}
      />
    {/await}
  </div>
</Modal>

<div id="records" class="overflow-x-auto">
  <table class="w-full">
    <thead>
      <tr>
        <th>Building</th>
        <th>Name</th>
        <th>Type</th>
        <th>Created</th>
        <th>Updated</th>
        <th>•••</th>
      </tr>
    </thead>
    <tbody>
      {#if data.room.total == 0}
        <tr>
          <td class="text-center text-secondary" colspan="6">No records found.</td>
        </tr>
      {/if}
      {#each data.room.data as room (room.id)}
        <tr class="hover:bg-light">
          <td class="text-center">{room.building.name}</td>
          <td class="text-center">{room.name}</td>
          <td class="text-center capitalize">{room.type}</td>
          <td class="fit-width whitespace-nowrap text-center text-sm">
            <p class="font-semibold">{new Date(room.createdAt).toLocaleDateString()}</p>
            <p class="text-dark">{new Date(room.createdAt).toLocaleTimeString()}</p>
            <p class="capitalize text-secondary">{room.createdBy.username}</p>
          </td>
          <td class="fit-width whitespace-nowrap text-center text-sm">
            <p class="font-semibold">{new Date(room.updatedAt).toLocaleDateString()}</p>
            <p class="text-dark">{new Date(room.updatedAt).toLocaleTimeString()}</p>
            <p class="capitalize text-secondary">{room.updatedBy.username}</p>
          </td>
          <td class="fit-width text-center">
            <div class="space-x-4 whitespace-nowrap">
              <button
                class="action-button text-blue-600"
                on:click={() => showEdit({ ...room, buildingId: room.building.id })}
              >
                Edit
              </button>
              <button
                class="action-button text-red-600"
                on:click={() => handleDelete({ id: room.id })}
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
    total={Math.ceil(data.room.total / data.room.limit)}
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
