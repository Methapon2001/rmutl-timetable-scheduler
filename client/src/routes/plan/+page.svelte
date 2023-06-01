<script lang="ts">
  import type { PageData } from './$types';
  import { page } from '$app/stores';
  import { invalidate } from '$app/navigation';
  import { blurOnEscape } from '$lib/utils/directives';
  import { deletePlan, editPlan } from '$lib/api/plan';
  import debounce from '$lib/utils/debounce';
  import Modal from '$lib/components/Modal.svelte';
  import Pagination from '$lib/components/Pagination.svelte';
  import Plan from './PlanForm.svelte';
  import PlanDetail from './PlanDetail.svelte';
  import toast from 'svelte-french-toast';
  import type { ComponentProps } from 'svelte';

  const handleSearch = debounce(async (text: string) => {
    const url = new URL(window.location.toString());
    url.searchParams.set('search', text);
    history.replaceState({}, '', url);
    await invalidate('data:plan');
  }, 300);

  const courseOptions = async () => {
    return (await data.lazy.course).data.map((course) => ({
      label: course.name,
      value: course.id,
      detail: course,
    }));
  };

  const subjectOptions = async () => {
    return (await data.lazy.subject).data.map((subject) => ({
      label: `${subject.code} ${subject.name}`,
      value: subject.id,
      detail: subject,
    }));
  };

  const formOptions = async () => {
    return {
      subject: await subjectOptions(),
      course: await courseOptions(),
    };
  };

  export let data: PageData;

  let newState = false;
  let editState = false;
  let editData: {
    id: string;
    name: string;
    detail: {
      year: number;
      semester: number;
      subjectId: string[];
    }[];
    courseId: string;
  };

  function showEdit(plan: {
    id: string;
    name: string;
    detail: {
      semester: number;
      year: number;
      subjectId: string;
    }[];
    courseId: string;
  }) {
    editState = true;
    editData = {
      ...plan,
      detail: groupDetailData(plan.detail),
    };
  }

  function groupDetailData(detail: { semester: number; year: number; subjectId: string }[]) {
    return Object.values(
      detail.reduce<{
        [key: string]: { year: number; semester: number; subjectId: string[] };
      }>((acc, obj) => {
        const key = `${obj.year}-${obj.semester}`;

        if (!acc[key]) acc[key] = { year: obj.year, semester: obj.semester, subjectId: [] };

        acc[key].subjectId.push(obj.subjectId);
        return acc;
      }, {}),
    );
  }

  async function handleDelete(plan: { id: string }) {
    if (confirm('Are you sure?')) {
      const ret = await deletePlan(plan).catch((e: Response) => console.error(e));

      if (ret) {
        await invalidate('data:plan');

        toast.success('Delete Complete!');
      } else {
        toast.error('Failed to delete plan!\nThis record is currenly in use.');
      }
    }
  }

  let showState = false;
  let showData: ComponentProps<PlanDetail>['planData'];

  const subjectMap = data.plan.data.reduce<
    Record<string, Omit<API.Subject, 'createdAt' | 'createdBy' | 'updatedAt' | 'updatedBy'>>
  >((acc, curr) => {
    curr.detail.forEach((det) => {
      if (!acc[`${det.subject.id}`]) acc[`${det.subject.id}`] = det.subject;
    });

    return acc;
  }, {});

  function showPlanDetail(plan: {
    id: string;
    name: string;
    detail: {
      semester: number;
      year: number;
      subjectId: string;
    }[];
    courseId: string;
  }) {
    showState = true;
    showData = {
      ...plan,
      detail: groupDetailData(plan.detail),
    };
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
      {#await formOptions()}
        Loading...
      {:then options}
        <Plan subjectOptions="{options.subject}" courseOptions="{options.course}" />
      {/await}
    </div>
  </div>
{/if}

<Modal bind:open="{editState}">
  <div id="edit" class="p-4">
    <h1 class="mb-4 block text-center text-2xl font-bold">Edit Plan</h1>
    {#await formOptions()}
      Loading...
    {:then options}
      <Plan
        courseOptions="{options.course}"
        subjectOptions="{options.subject}"
        edit="{true}"
        editData="{editData}"
        callback="{() => (editState = false)}"
      />
    {/await}
  </div>
</Modal>

<Modal bind:open="{showState}">
  <div id="show-modal" class="p-4">
    <h1 class="mb-4 block text-center text-2xl font-bold">Plan Detail</h1>
    <PlanDetail planData="{showData}" subjects="{subjectMap}" />
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
          <td class="text-secondary text-center" colspan="4">No records found.</td>
        </tr>
      {/if}
      {#each data.plan.data as plan (plan.id)}
        <tr
          on:click|stopPropagation="{() =>
            showPlanDetail({
              ...plan,
              detail: plan.detail.map((d) => ({ ...d, subjectId: d.subject.id })),
              courseId: plan.course.id,
            })}"
          class="hover:bg-light cursor-pointer"
        >
          <td class="text-center">{plan.name}</td>
          <td class="fit-width whitespace-nowrap text-center text-sm">
            <p class="font-semibold">{new Date(plan.createdAt).toLocaleDateString()}</p>
            <p class="text-dark">{new Date(plan.createdAt).toLocaleTimeString()}</p>
            <p class="text-secondary capitalize">{plan.createdBy.username}</p>
          </td>
          <td class="fit-width whitespace-nowrap text-center text-sm">
            <p class="font-semibold">{new Date(plan.updatedAt).toLocaleDateString()}</p>
            <p class="text-dark">{new Date(plan.updatedAt).toLocaleTimeString()}</p>
            <p class="text-secondary capitalize">{plan.updatedBy.username}</p>
          </td>
          <td class="fit-width text-center">
            <div class="space-x-4 whitespace-nowrap">
              <button
                class="action-button text-blue-600"
                on:click|stopPropagation="{() =>
                  showEdit({
                    ...plan,
                    detail: plan.detail.map((d) => ({ ...d, subjectId: d.subject.id })),
                    courseId: plan.course.id,
                  })}"
              >
                Edit
              </button>
              <button
                class="action-button text-red-600"
                on:click|stopPropagation="{() => handleDelete({ id: plan.id })}"
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
