<script lang="ts">
  import type { PageData } from './$types';
  import { page } from '$app/stores';
  import { invalidate } from '$app/navigation';
  import { blurOnEscape } from '$lib/utils/directives';
  import { deleteExam } from '$lib/api/exam';
  import debounce from '$lib/utils/debounce';
  import Modal from '$lib/components/Modal.svelte';
  import Pagination from '$lib/components/Pagination.svelte';
  import Exam from './ExamForm.svelte';
  import toast from 'svelte-french-toast';

  const handleSearch = debounce(async (text: string) => {
    const url = new URL(window.location.toString());
    url.searchParams.set('search', text);
    history.replaceState({}, '', url);
    await invalidate('data:exam');
  }, 300);

  const sectionOptions = async () => {
    return (await data.lazy.section).data.map((section) => ({
      label: `${section.subject.code} ${section.subject.name} Sec ${section.no}`,
      value: section.id,
      detail: section,
    }));
  };

  const instructorOptions = async () => {
    return (await data.lazy.instructor).data.map((instructor) => ({
      label: instructor.name,
      value: instructor.id,
    }));
  };

  const roomOptions = async () => {
    return (await data.lazy.room).data.map((room) => ({
      label: `${room.building.code}-${room.name} (${room.type
        .charAt(0)
        .toLocaleUpperCase()}${room.type.slice(1)})`,
      value: room.id,
      detail: room,
    }));
  };

  const formOptions = async () => {
    return {
      section: await sectionOptions(),
      instructor: await instructorOptions(),
      room: await roomOptions(),
    };
  };

  export let data: PageData;

  let newState = false;
  let editState = false;
  let editData: {
    id: string;
    roomId: string;
    section: string[];
    instructor: string[];
  };

  function showEdit(exam: {
    id: string;
    section: {
      id: string;
    }[];
    instructor: {
      id: string;
    }[];
    roomId: string;
  }) {
    editState = true;
    editData = {
      ...exam,
      section: exam.section.map((sec) => sec.id),
      instructor: exam.instructor.map((inst) => inst.id),
    };
  }

  async function handleDelete(exam: { id: string }) {
    if (confirm('Are you sure?')) {
      const ret = await deleteExam(exam).catch((e: Response) => console.error(e));

      if (ret) {
        await invalidate('data:exam');

        toast.success('Delete Complete!');
      } else {
        toast.error('Failed to delete exam!\nThis record is currenly in use.');
      }
    }
  }
</script>

<svelte:head>
  <title>Exam</title>
</svelte:head>

<div class="flex flex-wrap items-center justify-between gap-4 p-4 md:flex-nowrap">
  <div class="inline-flex w-full items-center space-x-2 font-medium md:w-fit">
    <a class="text-primary" href="/">Home</a>
    <span>/</span>
    <span class="text-secondary">Exam</span>
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
    New Exam
  </button>
</div>

{#if newState}
  <div id="new" class="bg-light p-4">
    <h1 class="mb-4 block text-center text-2xl font-bold">New Exam</h1>
    <div class="mx-auto max-w-screen-md rounded bg-white p-4 shadow">
      {#await formOptions()}
        Loading...
      {:then options}
        <Exam
          sectionOptions="{options.section}"
          instructorOptions="{options.instructor}"
          roomOptions="{options.room}"
        />
      {/await}
    </div>
  </div>
{/if}

<Modal bind:open="{editState}">
  <div id="edit" class="p-4">
    <h1 class="mb-4 block text-center text-2xl font-bold">Edit Exam</h1>
    {#await formOptions()}
      Loading...
    {:then options}
      <Exam
        sectionOptions="{options.section}"
        instructorOptions="{options.instructor}"
        roomOptions="{options.room}"
        editData="{editData}"
        edit="{true}"
      />
    {/await}
  </div>
</Modal>

<div id="records" class="overflow-x-auto">
  <table class="w-full">
    <thead>
      <tr>
        <th>Section</th>
        <th>Instructor.</th>
        <th>Room</th>
        <th>Created</th>
        <th>Updated</th>
        <th>•••</th>
      </tr>
    </thead>
    <tbody>
      {#if data.exam.total == 0}
        <tr>
          <td class="text-center text-secondary" colspan="6">No records found.</td>
        </tr>
      {/if}
      {#each data.exam.data as exam (exam.id)}
        <tr class="hover:bg-light">
          <td class="text-center">
            {#each exam.section as sec}
              <p>
                <span class="whitespace-nowrap">
                  {sec.subject.code}
                  {sec.subject.name} Sec {sec.no}
                </span>
              </p>
            {/each}
          </td>
          <td class="text-center">
            {#each exam.instructor as inst}
              <p>
                <span class="whitespace-nowrap rounded bg-light-hover px-2">
                  {inst.name}
                </span>
              </p>
            {/each}
          </td>
          <td class="text-center">{exam.room?.building.code ?? ''} {exam.room?.name ?? '-'}</td>
          <td class="fit-width whitespace-nowrap text-center text-sm">
            <p class="font-semibold">{new Date(exam.createdAt).toLocaleDateString()}</p>
            <p class="text-dark">{new Date(exam.createdAt).toLocaleTimeString()}</p>
            <p class="capitalize text-secondary">{exam.createdBy.username}</p>
          </td>
          <td class="fit-width whitespace-nowrap text-center text-sm">
            <p class="font-semibold">{new Date(exam.updatedAt).toLocaleDateString()}</p>
            <p class="text-dark">{new Date(exam.updatedAt).toLocaleTimeString()}</p>
            <p class="capitalize text-secondary">{exam.updatedBy.username}</p>
          </td>
          <td class="fit-width text-center">
            <div class="space-x-4 whitespace-nowrap">
              <button
                class="action-button text-blue-600"
                on:click="{() =>
                  showEdit({
                    id: exam.id,
                    section: exam.section,
                    instructor: exam.instructor,
                    roomId: exam.room?.id ?? '',
                  })}"
              >
                Edit
              </button>
              <button
                class="action-button text-red-600"
                on:click="{() => handleDelete({ id: exam.id })}"
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
    total="{Math.ceil(data.exam.total / data.exam.limit)}"
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
