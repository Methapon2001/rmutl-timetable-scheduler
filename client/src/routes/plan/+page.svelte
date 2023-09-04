<script lang="ts">
  import type { PageData } from './$types';
  import type { Plan, PlanDetail } from '$lib/types';
  import { page } from '$app/stores';
  import toast from 'svelte-french-toast';

  import { invalidate } from '$app/navigation';
  import { blurOnEscape } from '$lib/utils/directives';
  import { searchHandler } from '$lib/utils/search';
  import apiRequest from '$lib/api';

  import Modal from '$lib/components/Modal.svelte';
  import Pagination from '$lib/components/Pagination.svelte';
  import Form from './PlanForm.svelte';
  import Detail from './Detail.svelte';

  const handleSearch = searchHandler('data:course');

  export let data: PageData;

  let newState = false;
  let editState = false;
  let showState = false;

  let currentEditData: Plan & {
    detail: (Omit<PlanDetail, 'id'> & { subjectId: string })[];
    courseId: string;
  };

  let currentShowData: (typeof data)['plan']['data'][number];

  function triggerEdit(plan: typeof currentEditData) {
    editState = true;
    currentEditData = plan;
  }

  function triggerShow(plan: typeof currentShowData) {
    showState = true;
    currentShowData = plan;
  }

  async function handleDelete(id: string) {
    const flag = confirm('Are you sure? This action cannot be undone.');

    if (!flag) return;

    const ret = await apiRequest('/api/plan')
      .delete({ id })
      .catch((e) => console.error(e));

    if (!ret)
      return toast.error(
        'Failed to delete plan!\nThis record may currenly in use. \nSee console for more info.',
      );

    await invalidate('data:plan');
    toast.success('Delete Complete!');
  }
</script>

<svelte:head>
  <title>Plan</title>
</svelte:head>

<div class="flex flex-wrap items-center justify-between gap-4 p-4 md:flex-nowrap">
  <div class="inline-flex w-full items-center space-x-2 font-medium md:w-fit">
    <a class="text-primary" href="/">Home</a>
    <span>/</span>
    <span class="text-secondary">Plan</span>
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
    New Plan
  </button>
</div>

{#if newState}
  <div id="new" class="bg-light p-4">
    <h1 class="mb-4 block text-center text-2xl font-bold">New Plan</h1>
    <div class="mx-auto max-w-screen-md rounded bg-white p-4 shadow">
      <Form />
    </div>
  </div>
{/if}

<Modal bind:open="{editState}">
  <div id="edit" class="p-4">
    <h1 class="mb-4 block text-center text-2xl font-bold">Edit Plan</h1>
    <Form edit="{true}" {...currentEditData} callback="{() => (editState = false)}" />
  </div>
</Modal>

<Modal bind:open="{showState}">
  <div id="show-modal" class="p-4">
    <h1 class="mb-4 block text-center text-2xl font-bold">Plan Detail</h1>
    <Detail plan="{currentShowData}" />
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
      {#if data.plan.total == 0}
        <tr>
          <td class="text-center text-secondary" colspan="4">No records found.</td>
        </tr>
      {/if}
      {#each data.plan.data as plan (plan.id)}
        <tr
          on:click|stopPropagation="{() => triggerShow(plan)}"
          class="cursor-pointer hover:bg-light"
        >
          <td class="text-center">{plan.name}</td>
          <td class="fit-width whitespace-nowrap text-center text-sm">
            <p class="font-semibold">{new Date(plan.createdAt).toLocaleDateString()}</p>
            <p class="text-dark">{new Date(plan.createdAt).toLocaleTimeString()}</p>
            <p class="capitalize text-secondary">{plan.createdBy.username}</p>
          </td>
          <td class="fit-width whitespace-nowrap text-center text-sm">
            <p class="font-semibold">{new Date(plan.updatedAt).toLocaleDateString()}</p>
            <p class="text-dark">{new Date(plan.updatedAt).toLocaleTimeString()}</p>
            <p class="capitalize text-secondary">{plan.updatedBy.username}</p>
          </td>
          <td class="fit-width text-center">
            <div class="space-x-4 whitespace-nowrap">
              <button
                class="action-button text-blue-600"
                on:click|stopPropagation="{() =>
                  triggerEdit({
                    id: plan.id,
                    name: plan.name,
                    detail: plan.detail.map((v) => ({
                      year: v.year,
                      semester: v.semester,
                      subjectId: v.subject.id,
                    })),
                    courseId: plan.course.id,
                  })}"
              >
                Edit
              </button>
              <button
                class="action-button text-red-600"
                on:click|stopPropagation="{() => handleDelete(plan.id)}"
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
    total="{Math.ceil(data.plan.total / data.plan.limit)}"
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

