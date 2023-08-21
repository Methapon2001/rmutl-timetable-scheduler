<script lang="ts">
  import type { PageData } from './$types';
  import { page } from '$app/stores';
  import { invalidate } from '$app/navigation';
  import { blurOnEscape } from '$lib/utils/directives';
  import { deleteGroup } from '$lib/api/group';
  import debounce from '$lib/utils/debounce';
  import Modal from '$lib/components/Modal.svelte';
  import Pagination from '$lib/components/Pagination.svelte';
  import Group from './GroupForm.svelte';
  import toast from 'svelte-french-toast';

  const handleSearch = debounce(async (text: string) => {
    const url = new URL(window.location.toString());
    url.searchParams.set('search', text);
    history.replaceState({}, '', url);
    await invalidate('data:group');
  }, 300);

  const courseOptions = async () => {
    return (await data.lazy.course).data.map((course) => ({
      label: course.name,
      value: course.id,
    }));
  };

  const planOptions = async () => {
    return (await data.lazy.plan).data.map((plan) => ({
      label: plan.name,
      value: plan.id,
      detail: plan,
    }));
  };

  const formOptions = async () => ({
    course: await courseOptions(),
    plan: await planOptions(),
  });

  export let data: PageData;

  let newState = false;
  let editState = false;
  let editData: {
    id: string;
    name: string;
    courseId: string;
    planId: string;
  };

  function showEdit(group: { id: string; name: string; courseId: string; planId: string }) {
    editState = true;
    editData = group;
  }

  async function handleDelete(group: { id: string }) {
    if (confirm('Are you sure?')) {
      const ret = await deleteGroup(group).catch((e: Response) => console.error(e));

      if (ret) {
        await invalidate('data:group');

        toast.success('Delete Complete!');
      } else {
        toast.error('Failed to delete group!\nThis record is currenly in use.');
      }
    }
  }
</script>

<svelte:head>
  <title>Group</title>
</svelte:head>

<div class="flex flex-wrap items-center justify-between gap-4 p-4 md:flex-nowrap">
  <div class="inline-flex w-full items-center space-x-2 font-medium md:w-fit">
    <a class="text-primary" href="/">Home</a>
    <span>/</span>
    <span class="text-secondary">Group</span>
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

  <button type="button" class="button w-full md:w-fit disabled:bg-secondary disabled:border-secondary disabled:cursor-not-allowed" disabled="{!data.lazy.info?.current}" on:click="{() => (newState = !newState)}">
    New Group
  </button>
</div>

{#if newState}
  <div id="new" class="bg-light p-4">
    <h1 class="mb-4 block text-center text-2xl font-bold">New Group</h1>
    <div class="mx-auto max-w-screen-md rounded bg-white p-4 shadow">
      {#await formOptions()}
        Loading...
      {:then options}
        <Group courseOptions="{options.course}" planOptions="{options.plan}" />
      {/await}
    </div>
  </div>
{/if}

<Modal bind:open="{editState}">
  <div id="edit" class="p-4">
    <h1 class="mb-4 block text-center text-2xl font-bold">Edit Group</h1>
    {#await formOptions()}
      Loading...
    {:then options}
      <Group
        courseOptions="{options.course}"
        planOptions="{options.plan}"
        edit="{true}"
        editData="{editData}"
        callback="{() => (editState = false)}"
      />
    {/await}
  </div>
</Modal>

<div id="records" class="overflow-x-auto">
  <table class="w-full">
    <thead>
      <tr>
        <th>Name</th>
        <th>Course</th>
        <th>Plan</th>
        <th>Created</th>
        <th>Updated</th>
        <th>•••</th>
      </tr>
    </thead>
    <tbody>
      {#if data.group.total == 0}
        <tr>
          <td class="text-center text-secondary" colspan="7">No records found.</td>
        </tr>
      {/if}
      {#each data.group.data as group (group.id)}
        <tr class="hover:bg-light">
          <td class="text-center">{group.name}</td>
          <td class="text-center">{group.course.name}</td>
          <td class="text-center">{group.plan.name}</td>
          <td class="fit-width whitespace-nowrap text-center text-sm">
            <p class="font-semibold">{new Date(group.createdAt).toLocaleDateString()}</p>
            <p class="text-dark">{new Date(group.createdAt).toLocaleTimeString()}</p>
            <p class="capitalize text-secondary">{group.createdBy.username}</p>
          </td>
          <td class="fit-width whitespace-nowrap text-center text-sm">
            <p class="font-semibold">{new Date(group.updatedAt).toLocaleDateString()}</p>
            <p class="text-dark">{new Date(group.updatedAt).toLocaleTimeString()}</p>
            <p class="capitalize text-secondary">{group.updatedBy.username}</p>
          </td>
          <td class="fit-width text-center">
            <div class="space-x-4 whitespace-nowrap">
              <button
                class="action-button text-blue-600 disabled:text-secondary"
                on:click="{() =>
                  showEdit({ ...group, courseId: group.course.id, planId: group.plan.id })}"
                disabled="{data.session?.user.id != group.createdBy.id &&
                  data.session?.user.role != 'admin' || !data.lazy.info?.current}"
              >
                Edit
              </button>
              <button
                class="action-button text-red-600 disabled:text-secondary"
                on:click="{() => handleDelete({ id: group.id })}"
                disabled="{data.session?.user.id != group.createdBy.id &&
                  data.session?.user.role != 'admin' || !data.lazy.info?.current}"
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
    total="{Math.ceil(data.group.total / data.group.limit)}"
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
