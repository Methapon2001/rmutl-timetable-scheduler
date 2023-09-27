<script lang="ts">
  import type { PageData } from './$types';
  import type { Section, Subject } from '$lib/types';
  import { page } from '$app/stores';
  import toast from 'svelte-french-toast';

  import { goto, invalidate } from '$app/navigation';
  import { blurOnEscape } from '$lib/utils/directives';

  import { searchHandler } from '$lib/utils/search';
  import apiRequest from '$lib/api';

  import Modal from '$lib/components/Modal.svelte';
  import Pagination from '$lib/components/Pagination.svelte';
  import NewForm from './SectionNewForm.svelte';
  import EditForm from './SectionEditForm.svelte';

  const handleSearch = searchHandler('data:section');

  export let data: PageData;

  let newState = false;
  let editState = false;

  let currentData: Section & {
    roomId: string;
    groupId: string;
    instructorId: string[];
    subject: Subject;
  };

  function triggerEdit(section: typeof currentData) {
    editState = true;
    currentData = section;
  }

  async function handleDelete(id: string) {
    const flag = confirm('Are you sure? This action cannot be undone.');

    if (!flag) return;

    const ret = await apiRequest('/api/section')
      .delete({ id })
      .catch((e) => console.error(e));

    if (!ret)
      return toast.error(
        'Failed to delete section!\nThis record may currenly in use. \nSee console for more info.',
      );

    await invalidate('data:section');
    toast.success('Delete Complete!');
  }
</script>

<svelte:head>
  <title>Section</title>
</svelte:head>

<div class="flex flex-wrap items-center justify-between gap-4 p-4 md:flex-nowrap">
  <div class="inline-flex w-full items-center space-x-2 font-medium md:w-fit">
    <a class="text-primary" href="/">Home</a>
    <span>/</span>
    <span class="text-secondary">Section</span>
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

  <button
    type="button"
    class="button w-full disabled:cursor-not-allowed disabled:border-secondary disabled:bg-secondary md:w-fit"
    disabled="{!data.info?.current}"
    on:click="{() => (newState = !newState)}"
  >
    New Section
  </button>
  <button
    on:click="{() => goto('/section/gen')}"
    class="button w-full disabled:cursor-not-allowed disabled:border-secondary disabled:bg-secondary md:w-fit"
    disabled="{!data.info?.current}">Generate Section</button
  >
</div>

{#if newState}
  <div id="new" class="bg-light p-4">
    <h1 class="mb-4 block text-center text-2xl font-bold">New Section</h1>
    <div class="mx-auto max-w-screen-md rounded bg-white p-4 shadow">
      <NewForm />
    </div>
  </div>
{/if}

<Modal bind:open="{editState}">
  <div id="edit" class="p-4">
    <h1 class="block text-center text-2xl font-bold">Edit Section</h1>
    <hr class="my-2" />
    <EditForm {...currentData} />
  </div>
</Modal>

<div id="records" class="overflow-x-auto">
  <table class="w-full">
    <thead>
      <tr>
        <th>Subject</th>
        <th>No.</th>
        <th>Alt Section No.</th>
        <th>Type</th>
        <th>Lab No.</th>
        <th>Group</th>
        <th>Room</th>
        <th>Capacity</th>
        <th>Instructors</th>
        <th>Created</th>
        <th>Updated</th>
        <th>•••</th>
      </tr>
    </thead>
    <tbody>
      {#if data.section.total == 0}
        <tr>
          <td class="text-center text-secondary" colspan="11">No records found.</td>
        </tr>
      {/if}
      {#each data.section.data as section (section.id)}
        <tr class="hover:bg-light">
          <td class="whitespace-nowrap">{section.subject.code} {section.subject.name}</td>
          <td class="text-center">{section.no}</td>
          <td class="text-center">{section.alt ?? '-'}</td>
          <td class="text-center capitalize">{section.type}</td>
          <td class="text-center">{section.lab ?? '-'}</td>
          <td class="text-center">{section.group?.name ?? ''}</td>
          <td class="whitespace-nowrap text-center">
            {section.room?.building.code ?? ''}-{section.room?.name ?? ''}
          </td>
          <td class="text-center">{section.capacity}</td>
          <td class="space-y-2 text-center">
            {section.instructor.length ? '' : '-'}
            {#each section.instructor as instructor (instructor.id)}
              <p>
                <span class="whitespace-nowrap rounded bg-light-hover px-2"
                  >{instructor.name ?? '-'}</span
                >
              </p>
            {/each}
          </td>
          <td class="fit-width whitespace-nowrap text-center text-sm">
            <p class="font-semibold">{new Date(section.createdAt).toLocaleDateString()}</p>
            <p class="text-dark">{new Date(section.createdAt).toLocaleTimeString()}</p>
            <p class="capitalize text-secondary">{section.createdBy.username}</p>
          </td>
          <td class="fit-width whitespace-nowrap text-center text-sm">
            <p class="font-semibold">{new Date(section.updatedAt).toLocaleDateString()}</p>
            <p class="text-dark">{new Date(section.updatedAt).toLocaleTimeString()}</p>
            <p class="capitalize text-secondary">{section.updatedBy.username}</p>
          </td>
          <td class="fit-width text-center">
            <div class="space-x-4 whitespace-nowrap">
              <button
                class="action-button text-blue-600 disabled:text-secondary"
                disabled="{(data.session?.user.id != section.createdBy.id &&
                  data.session?.user.role != 'admin') ||
                  !data.info?.current}"
                on:click="{() =>
                  triggerEdit({
                    id: section.id,
                    no: section.no, // no-edit, readonly
                    lab: section.lab, // no-edit, readonly
                    type: section.type, // no-edit, readonly
                    alt: section.alt ?? '',
                    capacity: section.capacity,
                    groupId: section.group?.id ?? '',
                    roomId: section.room?.id ?? '',
                    instructorId: section.instructor.map((v) => v.id),
                    subject: section.subject, // no-edit, readonly
                  })}"
              >
                Edit
              </button>
              <button
                class="action-button text-red-600 disabled:text-secondary"
                disabled="{(data.session?.user.id != section.createdBy.id &&
                  data.session?.user.role != 'admin') ||
                  !data.info?.current}"
                on:click="{() => handleDelete(section.id)}"
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
    total="{Math.ceil(data.section.total / data.section.limit)}"
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

  .action-button:hover:not(:disabled) {
    @apply underline;
  }

  .fit-width {
    width: 1% !important;
  }
</style>
