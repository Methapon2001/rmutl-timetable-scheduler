<script lang="ts">
  import type { PageData } from './$types';
  import { page } from '$app/stores';
  import { invalidate } from '$app/navigation';
  import { blurOnEscape } from '$lib/utils/directives';
  import { deleteSection } from '$lib/api/section';
  import debounce from '$lib/utils/debounce';
  import Modal from '$lib/components/Modal.svelte';
  import Pagination from '$lib/components/Pagination.svelte';
  import SectionNewForm from './NewForm.svelte';
  import SectionEditForm from './EditForm.svelte';
  import toast from 'svelte-french-toast';

  const handleSearch = debounce(async (text: string) => {
    const url = new URL(window.location.toString());
    url.searchParams.set('search', text);
    history.replaceState({}, '', url);
    await invalidate('data:section');
  }, 300);

  const groupOptions = async () => {
    return (await data.lazy.group).data.map((group) => ({
      label: group.name,
      value: group.id,
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

  const subjectOptions = async () => {
    return (await data.lazy.subject).data.map((subject) => ({
      label: `${subject.code} ${subject.name}`,
      value: subject.id,
      detail: subject,
    }));
  };

  const instructorOptions = async () => {
    return (await data.lazy.instructor).data.map((instructor) => ({
      label: instructor.name,
      value: instructor.id,
    }));
  };

  const formOptions = async () => {
    return {
      group: await groupOptions(),
      subject: await subjectOptions(),
      room: await roomOptions(),
      instructor: await instructorOptions(),
    };
  };

  export let data: PageData;

  let newState = false;
  let editState = false;
  let editData: {
    id: string;
    alt: string;
    groupId: string;
    roomId: string;
    instructor: string[];
  };

  let showData: {
    no: number;
    lab: number | null;
    subject: { name: string };
    type: string;
  };

  function showEdit(
    editSectionData: {
      id: string;
      alt: string;
      groupId: string;
      roomId: string;
      instructor: {
        id: string;
      }[];
    },
    showSectionData: {
      no: number;
      type: string;
      lab: number | null;
      subject: { name: string };
    },
  ) {
    editState = true;
    editData = {
      ...editSectionData,
      instructor: editSectionData.instructor.map((inst) => inst.id),
    };
    showData = showSectionData;
  }

  async function handleDelete(section: { id: string }) {
    if (confirm('Are you sure?')) {
      const ret = await deleteSection(section).catch((e: Response) => console.error(e));
      
      if (ret) {
        await invalidate('data:section');

        toast.success('Delete Complete!');
      } else {
        toast.error('Fail to delete section!\nThis record is currenly in use.');
      }
    }
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

  <button type="button" class="button w-full md:w-fit" on:click="{() => (newState = !newState)}">
    New Section
  </button>
</div>

{#if newState}
  <div id="new" class="bg-light p-4">
    <h1 class="mb-4 block text-center text-2xl font-bold">New Section</h1>
    <div class="mx-auto max-w-screen-md rounded bg-white p-4 shadow">
      {#await formOptions()}
        Loading...
      {:then options}
        <SectionNewForm
          groupOptions="{options.group}"
          roomOptions="{options.room}"
          subjectOptions="{options.subject}"
          instructorOptions="{options.instructor}"
        />
      {/await}
    </div>
  </div>
{/if}

<Modal bind:open="{editState}">
  <div id="edit" class="p-4">
    <h1 class="mb-4 block text-center text-2xl font-bold">Edit Section</h1>
    {#await formOptions()}
      Loading...
    {:then options}
      <SectionEditForm
        groupOptions="{options.group}"
        roomOptions="{options.room}"
        instructorOptions="{options.instructor}"
        edit="{true}"
        editData="{editData}"
        showData="{showData}"
        callback="{() => (editState = false)}"
      />
    {/await}
  </div>
</Modal>

<div id="records" class="overflow-x-auto">
  <table class="w-full">
    <thead>
      <tr>
        <th>Subject</th>
        <th>No.</th>
        <th>Alternate Section No.</th>
        <th>Type</th>
        <th>Lab No.</th>
        <th>Group</th>
        <th>Room</th>
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
          <td class="whitespace-nowrap"
            >{section.subject.code} {section.subject.name}</td
          >
          <td class="text-center">{section.no}</td>
          <td class="text-center">{section.alt ?? '-'}</td>
          <td class="text-center capitalize">{section.type}</td>
          <td class="text-center">{section.lab ?? '-'}</td>
          <td class="text-center">{section.group?.name ?? ''}</td>
          <td class="whitespace-nowrap text-center">
            {section.room?.building.code ?? ''}-{section.room?.name ?? ''}
          </td>
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
                class="action-button text-blue-600 text-blue-600 disabled:text-secondary"
                disabled="{data.session?.user.id != section.createdBy.id &&
                  data.session?.user.role != 'admin'}"
                on:click="{() =>
                  showEdit(
                    {
                      id: section.id,
                      alt: section.alt,
                      groupId: section.group?.id ?? '',
                      roomId: section.room?.id ?? '',
                      instructor: section.instructor,
                    },
                    {
                      no: section.no,
                      type: section.type,
                      lab: section.lab,
                      subject: section.subject,
                    },
                  )}"
              >
                Edit
              </button>
              <button
                class="action-button text-blue-600 text-red-600 disabled:text-secondary"
                disabled="{data.session?.user.id != section.createdBy.id &&
                  data.session?.user.role != 'admin'}"
                on:click="{() => handleDelete({ id: section.id })}"
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
