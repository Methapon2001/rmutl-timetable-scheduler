<script lang="ts">
    import type { PageData } from './$types';
    import { page } from '$app/stores';
    import { invalidate } from '$app/navigation';
    import { blurOnEscape } from '$lib/utils/directives';
    import { deleteInfo } from '$lib/api/info';
    import debounce from '$lib/utils/debounce';
    import Modal from '$lib/components/Modal.svelte';
    import Pagination from '$lib/components/Pagination.svelte';
    import Info from './InfoForm.svelte';
    import toast from 'svelte-french-toast';
  
    const handleSearch = debounce(async (text: string) => {
      const url = new URL(window.location.toString());
      url.searchParams.set('search', text);
      history.replaceState({}, '', url);
      await invalidate('data:info');
    }, 300);
  
    export let data: PageData;
  
    let newState = false;
    let editState = false;
    let editData: {
      id: string;
      year: number;
      semester: number;
      current: boolean;
    };
  
    function showEdit(info: { id: string; year: number; semester: number; current: boolean; }) {
      editState = true;
      editData = info;
    }
  
    async function handleDelete(info: { id: string }) {
      if (confirm('Are you sure?')) {
        const ret = await deleteInfo(info).catch((e: Response) => console.error(e));
  
        if (ret) {
          await invalidate('data:info');
  
          toast.success('Delete Complete!');
        } else {
          toast.error('Failed to delete info!\nThis record is currenly in use.');
        }
      }
    }
  </script>
  
  <svelte:head>
    <title>Info</title>
  </svelte:head>
  
  <div class="flex flex-wrap items-center justify-between gap-4 p-4 md:flex-nowrap">
    <div class="inline-flex w-full items-center space-x-2 font-medium md:w-fit">
      <a class="text-primary" href="/">Home</a>
      <span>/</span>
      <span class="text-secondary">Info</span>
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
      New Info
    </button>
  </div>
  
  {#if newState}
    <div id="new" class="bg-light p-4">
      <h1 class="mb-4 block text-center text-2xl font-bold">New Info</h1>
      <div class="mx-auto max-w-screen-md rounded bg-white p-4 shadow">
        <Info />
      </div>
    </div>
  {/if}
  
  <Modal bind:open="{editState}">
    <div id="edit" class="p-4">
      <h1 class="mb-4 block text-center text-2xl font-bold">Edit Info</h1>
      <Info edit="{true}" editData="{editData}" callback="{() => (editState = false)}" />
    </div>
  </Modal>
  
  <div id="records" class="overflow-x-auto">
    <table class="w-full">
      <thead>
        <tr>
            <th>Semester/Year</th>
            <th>Status</th>
          <th>•••</th>
        </tr>
      </thead>
      <tbody>
        {#if data.info.total == 0}
          <tr>
            <td class="text-center text-secondary" colspan="3">No records found.</td>
          </tr>
        {/if}
        {#each data.info.data as info (info.id)}
          <tr class="hover:bg-light">
            <td class="text-center" width="10%">{info.semester}/{info.year}</td>
            <td class="text-center" width="10%">{#if info.current}<span class="bg-green-500 text-white rounded px-2 font-semibold py-1">Active</span>{/if}</td>
            <td class="fit-width text-center">
              <div class="space-x-4 whitespace-nowrap">
                <button class="action-button text-blue-600" on:click="{() => showEdit(info)}">
                  Edit
                </button>
                <button
                  class="action-button text-red-600"
                  on:click="{() => handleDelete({ id: info.id })}"
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
      total="{Math.ceil(data.info.total / data.info.limit)}"
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
  