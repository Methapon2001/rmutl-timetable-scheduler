<script lang="ts">
  import type { PageData } from './$types';
  import type { User } from '$lib/types';
  import { page } from '$app/stores';
  import toast from 'svelte-french-toast';

  import { invalidate } from '$app/navigation';
  import { blurOnEscape } from '$lib/element';

  import { searchHandler } from '$lib/utils/search';
  import apiRequest from '$lib/api';

  import Modal from '$lib/components/Modal.svelte';
  import Pagination from '$lib/components/Pagination.svelte';
  import Form from './UserForm.svelte';

  const handleSearch = searchHandler('data:user');

  export let data: PageData;

  let newState = false;
  let editState = false;

  let currentData: User;

  function triggerEdit(user: typeof currentData) {
    editState = true;
    currentData = user;
  }

  async function handleDelete(id: string) {
    const flag = confirm('Are you sure? This action cannot be undone.');

    if (!flag) return;

    const ret = await apiRequest('/api/user')
      .delete({ id })
      .catch((e) => console.error(e));

    if (!ret)
      return toast.error(
        'Failed to delete user!\nThis record may currenly in use. \nSee console for more info.',
      );

    await invalidate('data:user');
    toast.success('Delete Complete!');
  }
</script>

<svelte:head>
  <title>User</title>
</svelte:head>

<div class="flex flex-wrap items-center justify-between gap-4 p-4 md:flex-nowrap">
  <div class="inline-flex w-full items-center space-x-2 font-medium md:w-fit">
    <a class="text-primary" href="/">Home</a>
    <span>/</span>
    <span class="text-secondary">User</span>
  </div>

  <div class="w-full md:w-fit md:flex-grow md:px-16">
    <input
      name="search"
      type="text"
      class="search w-full"
      placeholder="Search"
      autocomplete="off"
      value="{$page.url.searchParams.get('search')}"
      on:input="{(e) => handleSearch(e.currentTarget.value)}"
      use:blurOnEscape
    />
  </div>

  <button type="button" class="button w-full md:w-fit" on:click="{() => (newState = !newState)}">
    New User
  </button>
</div>

{#if newState}
  <div id="new" class="bg-light p-4">
    <h1 class="mb-4 block text-center text-2xl font-bold">New User</h1>
    <div class="mx-auto max-w-screen-md rounded bg-white p-4 shadow">
      <Form />
    </div>
  </div>
{/if}

<Modal bind:open="{editState}">
  <div id="edit" class="p-4">
    <h1 class="mb-4 block text-center text-2xl font-bold">Edit User</h1>
    <Form edit="{true}" {...currentData} callback="{() => (editState = false)}" />
  </div>
</Modal>

<div id="records" class="overflow-x-auto">
  <table class="w-full">
    <thead>
      <tr>
        <th>Username</th>
        <th>Role</th>
        <th>Created</th>
        <th>Updated</th>
        <th>•••</th>
      </tr>
    </thead>
    <tbody>
      {#if data.user.total == 0}
        <tr>
          <td class="text-center text-secondary" colspan="4">No records found.</td>
        </tr>
      {/if}
      {#each data.user.data as user (user.id)}
        <tr class="hover:bg-light">
          <td class="text-center">{user.username}</td>
          <td class="text-center">{user.role}</td>
          <td class="fit-width whitespace-nowrap text-center text-sm">
            <p class="font-semibold">{new Date(user.createdAt).toLocaleDateString()}</p>
            <p class="text-dark">{new Date(user.createdAt).toLocaleTimeString()}</p>
          </td>
          <td class="fit-width whitespace-nowrap text-center text-sm">
            <p class="font-semibold">{new Date(user.updatedAt).toLocaleDateString()}</p>
            <p class="text-dark">{new Date(user.updatedAt).toLocaleTimeString()}</p>
          </td>
          <td class="fit-width text-center">
            <div class="space-x-4 whitespace-nowrap">
              <button class="action-button text-blue-600" on:click="{() => triggerEdit(user)}">
                Edit
              </button>
              <button class="action-button text-red-600" on:click="{() => handleDelete(user.id)}">
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
    total="{Math.ceil(data.user.total / data.user.limit)}"
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
