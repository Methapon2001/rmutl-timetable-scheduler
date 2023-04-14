<script lang="ts">
  import type { PageData } from './$types';
  import { page } from '$app/stores';
  import { invalidate } from '$app/navigation';
  import { slide } from 'svelte/transition';
  import { blurOnEscape } from '$lib/utils/directives';
  import { deleteSubject } from '$lib/api/subject';
  import debounce from '$lib/utils/debounce';
  import Modal from '$lib/components/Modal.svelte';
  import Pagination from '$lib/components/Pagination.svelte';
  import SubjectForm from './SubjectForm.svelte';

  const handleSearch = debounce(async (text: string) => {
    const url = new URL(window.location.toString());
    if (text.length == 0) {
      url.searchParams.delete('search');
    } else {
      url.searchParams.set('search', text);
    }
    history.replaceState({}, '', url);
    await invalidate('data:subject');
  }, 300);

  export let data: PageData;

  let newState = false;
  let editState = false;
  let editData: {
    code: string;
    id: string;
    name: string;
    credit: number;
    lecture: number;
    lab: number;
    exam: number;
  };

  function showEdit(subject: {
    code: string;
    id: string;
    name: string;
    credit: number;
    lecture: number;
    lab: number;
    exam: number;
  }) {
    editState = true;
    editData = subject;
  }

  async function handleDelete(subject: { id: string }) {
    if (confirm('Are you sure?')) {
      await deleteSubject(subject).catch((e: Response) => console.error(e));
      await invalidate('data:subject');
    }
  }
</script>

<svelte:head>
  <title>Subject</title>
</svelte:head>

<div class="flex flex-wrap items-center justify-between gap-4 p-4 md:flex-nowrap">
  <div class="inline-flex w-full items-center space-x-2 font-medium md:w-fit">
    <a class="text-primary" href="/">Home</a>
    <span>/</span>
    <span class="text-secondary">Subject</span>
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
    New Subject
  </button>
</div>

{#if newState}
  <div id="new" class="bg-light p-4" transition:slide>
    <h1 class="mb-4 block text-center text-2xl font-bold">New Subject</h1>
    <div class="mx-auto max-w-screen-md rounded bg-white p-4 shadow">
      <SubjectForm />
    </div>
  </div>
{/if}

<Modal bind:open={editState}>
  <div id="edit" class="p-4">
    <h1 class="mb-4 block text-center text-2xl font-bold">Edit Subject</h1>
    <SubjectForm edit={true} {editData} callback={() => (editState = false)} />
  </div>
</Modal>

<div id="records" class="overflow-x-auto">
  <table class="w-full">
    <thead>
      <tr>
        <th>Code</th>
        <th>Name</th>
        <th>Credit</th>
        <th>Lecture</th>
        <th>Lab</th>
        <th>Exam</th>
        <th>Created</th>
        <th>Updated</th>
        <th>•••</th>
      </tr>
    </thead>
    <tbody>
      {#if data.subject.total == 0}
        <tr>
          <td class="text-secondary text-center" colspan="9">No records found.</td>
        </tr>
      {/if}
      {#each data.subject.data as subject (subject.id)}
        <tr class="hover:bg-light">
          <td class="text-center">{subject.code}</td>
          <td>{subject.name}</td>
          <td class="text-center">{subject.credit}</td>
          <td class="text-center">{subject.lecture}</td>
          <td class="text-center">{subject.lab}</td>
          <td class="text-center">{subject.exam}</td>
          <td class="fit-width whitespace-nowrap text-center text-sm">
            <p class="font-semibold">{new Date(subject.createdAt).toLocaleDateString()}</p>
            <p class="text-dark">{new Date(subject.createdAt).toLocaleTimeString()}</p>
            <p class="text-secondary capitalize">{subject.createdBy.username}</p>
          </td>
          <td class="fit-width whitespace-nowrap text-center text-sm">
            <p class="font-semibold">{new Date(subject.updatedAt).toLocaleDateString()}</p>
            <p class="text-dark">{new Date(subject.updatedAt).toLocaleTimeString()}</p>
            <p class="text-secondary capitalize">{subject.updatedBy.username}</p>
          </td>
          <td class="fit-width text-center">
            <div class="space-x-4 whitespace-nowrap">
              <button class="action-button text-blue-600" on:click={() => showEdit({ ...subject })}>
                Edit
              </button>
              <button
                class="action-button text-red-600"
                on:click={() => handleDelete({ id: subject.id })}
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

{#if (!$page.url.searchParams.has('search') || $page.url.searchParams.get('search')?.length == 0) && data.subject.total / data.subject.limit != 0}
  <div id="pagination">
    <Pagination
      current={+($page.url.searchParams.get('page') ?? 1)}
      range={3}
      total={Math.ceil(data.subject.total / data.subject.limit)}
    />
  </div>
{/if}

<style lang="postcss">
  tr {
    @apply border-b;
  }

  th {
    @apply p-4;
  }

  td {
    @apply py-2 px-4;
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
