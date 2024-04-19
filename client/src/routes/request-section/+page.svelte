<script lang="ts">
  import type { PageData } from './$types';

  import toast from 'svelte-french-toast';

  import { env } from '$env/dynamic/public';
  import { invalidate } from '$app/navigation';
  import { refresh } from '$lib/api/auth';

  import Modal from '$lib/components/Modal.svelte';
  import SectionNewForm from '../section/SectionNewForm.svelte';

  const url = env.PUBLIC_API_HOST ? env.PUBLIC_API_HOST : window.location.origin;
  export let data: PageData;

  let open = false;

  let currentData: (typeof data)['requestSection']['data'][number] | undefined;

  async function requestSection(action: 'open' | 'close') {
    const confirm =
      action === 'close'
        ? window.confirm('All data will be deleted and cannot be undone, are you sure?')
        : true;

    if (!confirm) return;

    data.session = await refresh();

    const res = await fetch(`${url}/api/request-section/${action}`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${data.session?.token.access}`,
      },
    });

    if (!res.ok) throw res;

    await invalidate('data:request-section');
  }

  async function deleteRequestSection() {
    const res = await fetch(`${url}/api/request-section/${currentData?.id}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${data.session?.token.access}`,
      },
    });

    if (!res.ok) throw res;

    await invalidate('data:request-section');
  }

  async function copyToClipboard(textToCopy: string) {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(textToCopy);
    } else {
      const textarea = document.createElement('textarea');
      textarea.value = textToCopy;

      // Move the textarea outside the viewport to make it invisible
      textarea.style.position = 'absolute';
      textarea.style.left = '-99999999px';

      document.body.prepend(textarea);

      // highlight the content of the textarea element
      textarea.select();

      try {
        document.execCommand('copy');
      } catch (err) {
        console.log(err);
      } finally {
        textarea.remove();
      }
    }
  }
</script>

<svelte:head>
  <title>Request Section</title>
</svelte:head>

<Modal bind:open="{open}">
  <div id="edit" class="p-4">
    <h1 class="mb-4 block text-center text-2xl font-bold">
      {currentData?.subject.code}
      {currentData?.subject.name}
    </h1>
    <SectionNewForm
      subjectId="{currentData?.subject.id}"
      defaultInstructor="{currentData?.requester.id}"
      callback="{() => {
        open = false;
        deleteRequestSection();
      }}"
      lockSubject
    />
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
          copyToClipboard(
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
                  open = true;
                  currentData = reqSec;
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
