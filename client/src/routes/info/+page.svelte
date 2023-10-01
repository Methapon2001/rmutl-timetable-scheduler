<script lang="ts">
  import type { PageData } from './$types';
  import type { Info } from '$lib/types';
  import { page } from '$app/stores';
  import toast from 'svelte-french-toast';

  import { invalidate } from '$app/navigation';
  import { blurOnEscape } from '$lib/element';
  import { searchHandler } from '$lib/utils/search';
  import apiRequest from '$lib/api';

  import Modal from '$lib/components/Modal.svelte';
  import Pagination from '$lib/components/Pagination.svelte';
  import Form from './InfoForm.svelte';

  const search = searchHandler('data:info');

  export let data: PageData;

  let newState = false;

  async function handleDelete(id: string) {
    let flag = confirm('You are trying to delete all data related to this info, please confirm.');

    if (!flag) return;

    flag = confirm('Are you sure? This action cannot be undone.');

    if (!flag) return;

    const ret = await apiRequest('/api/info')
      .delete({ id })
      .catch((e) => console.error(e));

    if (!ret)
      return toast.error(
        'Failed to delete info!\nThis record may currenly in use. \nSee console for more info.',
      );

    await invalidate('data:info');
    toast.success('Delete Complete!');
  }

  async function setCurrent(info: { id: string; year: number; semester: number }) {
    const ret = await apiRequest('/api/info')
      .put({
        id: info.id,
        year: info.year,
        semester: info.semester,
        current: true,
      })
      .catch((e) => console.error(e));

    if (ret) {
      await invalidate('data:info');

      toast.success('Set Current Complete!');
    } else {
      toast.error('Fail to Set Current!');
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
      on:input="{(e) => search(e.currentTarget.value)}"
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
      <Form />
    </div>
  </div>
{/if}

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
          <td class="text-center" width="10%"
            >{#if info.current}<span class="rounded bg-green-500 px-2 py-1 font-semibold text-white"
                >Active</span
              >{/if}</td
          >
          <td class="fit-width text-center">
            <div class="space-x-4 whitespace-nowrap">
              <button
                class="action-button text-green-600 disabled:text-secondary"
                disabled="{info.current}"
                on:click="{() => setCurrent(info)}"
              >
                Set Current
              </button>
              <button class="action-button text-red-600" on:click="{() => handleDelete(info.id)}">
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
