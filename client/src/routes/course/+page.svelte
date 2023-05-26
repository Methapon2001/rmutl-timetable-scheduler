<script lang="ts">
  import type { PageData } from './$types';
  import { page } from '$app/stores';
  import { invalidate } from '$app/navigation';
  import { blurOnEscape } from '$lib/utils/directives';
  import { deleteCourse } from '$lib/api/course';
  import debounce from '$lib/utils/debounce';
  import Modal from '$lib/components/Modal.svelte';
  import Pagination from '$lib/components/Pagination.svelte';
  import Course from './CourseForm.svelte';
  import CourseDetail from './CourseDetail.svelte';
  import toast from 'svelte-french-toast';

  const handleSearch = debounce(async (text: string) => {
    const url = new URL(window.location.toString());
    url.searchParams.set('search', text);
    history.replaceState({}, '', url);
    await invalidate('data:course');
  }, 300);

  const subjectOptions = async () => {
    return (await data.lazy.subject).data.map((subject) => ({
      label: `${subject.code} ${subject.name}`,
      value: subject.id,
    }));
  };

  export let data: PageData;

  let newState = false;
  let editState = false;
  let editData: {
    id: string;
    name: string;
    detail: {
      compulsory: string[];
      elective: string[];
    };
  };

  function showEdit(course: {
    id: string;
    name: string;
    detail: {
      subject: { id: string };
      type: string;
    }[];
  }) {
    editState = true;
    editData = {
      ...course,
      detail: course.detail.reduce<{ compulsory: string[]; elective: string[] }>(
        (acc, curr) => {
          if (curr.type == 'compulsory') acc.compulsory.push(curr.subject.id);
          else acc.elective.push(curr.subject.id);
          return acc;
        },
        { compulsory: [], elective: [] },
      ),
    };
  }

  async function handleDelete(course: { id: string }) {
    if (confirm('Are you sure?')) {
      const ret = await deleteCourse(course).catch((e: Response) => console.error(e));

      if (ret) {
        await invalidate('data:course');

        toast.success('Delete Complete!');
      } else {
        toast.error('Failed to delete course!\nThis record is currenly in use.');
      }
    }
  }

  let showState = false;
  let showData: API.Course;

  function showCourseDetail(course: API.Course) {
    showState = true;
    showData = {
      ...course,
    };
  }
</script>

<svelte:head>
  <title>Course</title>
</svelte:head>

<div class="flex flex-wrap items-center justify-between gap-4 p-4 md:flex-nowrap">
  <div class="inline-flex w-full items-center space-x-2 font-medium md:w-fit">
    <a class="text-primary" href="/">Home</a>
    <span>/</span>
    <span class="text-secondary">Course</span>
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
    New Course
  </button>
</div>

{#if newState}
  <div id="new" class="bg-light p-4">
    <h1 class="mb-4 block text-center text-2xl font-bold">New Course</h1>
    <div class="mx-auto max-w-screen-md rounded bg-white p-4 shadow">
      {#await subjectOptions()}
        Loading...
      {:then options}
        <Course subjectOptions="{options}" />
      {/await}
    </div>
  </div>
{/if}

<Modal bind:open="{editState}">
  <div id="edit" class="p-4">
    <h1 class="mb-4 block text-center text-2xl font-bold">Edit Course</h1>
    {#await subjectOptions()}
      Loading...
    {:then options}
      <Course
        subjectOptions="{options}"
        edit="{true}"
        editData="{editData}"
        callback="{() => (editState = false)}"
      />
    {/await}
  </div>
</Modal>

<Modal bind:open="{showState}">
  <div id="edit" class="p-4">
    <h1 class="mb-4 block text-center text-2xl font-bold">Detail Course</h1>
    <CourseDetail courseData="{showData}" />
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
      {#if data.course.total == 0}
        <tr>
          <td class="text-secondary text-center" colspan="4">No records found.</td>
        </tr>
      {/if}
      {#each data.course.data as course (course.id)}
        <tr
          on:click|stopPropagation="{() => {
            showState = true;
            showData = course;
          }}"
          class="hover:bg-light cursor-pointer"
        >
          <td class="text-center">{course.name}</td>
          <td class="fit-width whitespace-nowrap text-center text-sm">
            <p class="font-semibold">{new Date(course.createdAt).toLocaleDateString()}</p>
            <p class="text-dark">{new Date(course.createdAt).toLocaleTimeString()}</p>
            <p class="text-secondary capitalize">{course.createdBy.username}</p>
          </td>
          <td class="fit-width whitespace-nowrap text-center text-sm">
            <p class="font-semibold">{new Date(course.updatedAt).toLocaleDateString()}</p>
            <p class="text-dark">{new Date(course.updatedAt).toLocaleTimeString()}</p>
            <p class="text-secondary capitalize">{course.updatedBy.username}</p>
          </td>
          <td class="fit-width text-center">
            <div class="space-x-4 whitespace-nowrap">
              <button class="action-button text-blue-600" on:click|stopPropagation="{() => showEdit(course)}">
                Edit
              </button>
              <button
                class="action-button text-red-600"
                on:click|stopPropagation="{() => handleDelete({ id: course.id })}"
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
    total="{Math.ceil(data.course.total / data.course.limit)}"
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
