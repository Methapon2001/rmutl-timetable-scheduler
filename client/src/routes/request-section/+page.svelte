<script lang="ts">
  import type { PageData } from './$types';
  import { PUBLIC_API_HOST } from '$env/static/public';
  import { invalidate } from '$app/navigation';
  import Modal from '$lib/components/Modal.svelte';
  import NewForm from './NewForm.svelte';
  import toast from 'svelte-french-toast';

  export let data: PageData;

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

  let createState = false;
  let createSubjectId: string;
  let createInstructorId: string;
  let requestId: string;

  const formOptions = async () => {
    return {
      group: await groupOptions(),
      subject: await subjectOptions(),
      room: await roomOptions(),
      instructor: await instructorOptions(),
    };
  };

  async function requestSection(action: 'open' | 'close') {
    let confirm: boolean;

    if (action === 'close') {
      confirm = window.confirm('All data will be deleted and cannot be undone, are you sure?');
    } else {
      confirm = true;
    }

    if (!confirm) return;

    const res = await fetch(`${PUBLIC_API_HOST}/api/request-section/${action}`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${data.session?.token.access}`,
      },
    });

    if (!res.ok) throw res;

    await invalidate('data:request-section');
  }

  async function deleteRequestSection() {
    const res = await fetch(`${PUBLIC_API_HOST}/api/request-section/${requestId}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${data.session?.token.access}`,
      },
    });

    if (!res.ok) throw res;

    await invalidate('data:request-section');
  }
</script>

<svelte:head>
  <title>Request Section</title>
</svelte:head>

<Modal bind:open="{createState}">
  <div id="edit" class="p-4">
    <h1 class="mb-4 block text-center text-2xl font-bold">Edit Section</h1>
    {#await formOptions()}
      Loading...
    {:then options}
      <NewForm
        groupOptions="{options.group}"
        roomOptions="{options.room}"
        subjectOptions="{options.subject}"
        instructorOptions="{options.instructor}"
        instructorId="{createInstructorId}"
        subjectId="{createSubjectId}"
        callback="{() => {
          createState = false;
          deleteRequestSection();
        }}"
      />
    {/await}
  </div>
</Modal>

{#if !data.requestSectionStatus.data}
  <div class="flex w-full justify-center">
    <div class="block p-3">
      <h3 class="text-center font-bold">Status : <span class="text-red-500">Closed</span></h3>
      <button class="button" on:click="{() => requestSection('open')}">Open Request</button>
    </div>
  </div>
{:else}
  <div class="flex w-full justify-center">
    <div class="block p-3">
      <h3 class="text-center font-bold">Status : <span class="text-green-600">Opened</span></h3>
      <button class="button" on:click="{() => requestSection('close')}">Close Request</button>
      <button
        class="button"
        on:click="{() => {
          navigator.clipboard.writeText(
            `${window.location.origin}/request-section-form?key=${data.requestSectionStatus.data.key}`,
          );

          toast.success('Link Copied');
        }}"
      >
        Copy Form Link
      </button>
    </div>
  </div>
{/if}

<div id="records" class="overflow-x-auto">
  <table class="w-full">
    <thead>
      <tr>
        <th>No</th>
        <th>Subject</th>
        <th>Requester</th>
        <th>Request to</th>
        <th>Created</th>
        <th>•••</th>
      </tr>
    </thead>
    <tbody>
      {#if data.requestSection.data.length == 0}
        <tr>
          <td class="text-center text-secondary" colspan="5">No records found.</td>
        </tr>
      {/if}

      {#each data.requestSection.data as reqSec (reqSec.id)}
        <tr class="hover:bg-light">
          <td class="text-center" width="10%">{reqSec.number}</td>
          <td class="text-center">{reqSec.subject.code} {reqSec.subject.name}</td>
          <td class="text-center">{reqSec.requester.name}</td>
          <td class="text-center">{reqSec.openedRequestSection.opener.username}</td>
          <td class="fit-width whitespace-nowrap text-center text-sm">
            <p class="font-semibold">{new Date(reqSec.createdAt).toLocaleDateString()}</p>
            <p class="text-dark">{new Date(reqSec.createdAt).toLocaleTimeString()}</p>
          </td>
          <td class="fit-width text-center">
            <div class="space-x-4 whitespace-nowrap">
              <button
                class="action-button text-blue-600"
                on:click="{() => {
                  createState = true;
                  createInstructorId = reqSec.requester.id;
                  createSubjectId = reqSec.subject.id;
                  requestId = reqSec.id;
                }}"
              >
                Create Section
              </button>
            </div>
          </td>
        </tr>
      {/each}
    </tbody>
  </table>
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
