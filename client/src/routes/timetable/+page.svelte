<script lang="ts">
  import type { ComponentProps } from 'svelte';
  import type { PageData } from './$types';
  import Table from './Table.svelte';
  import { createScheduler } from '$lib/api/scheduler';
  import { invalidate } from '$app/navigation';

  export let data: PageData;

  let scheduler: ComponentProps<Table>['data'];

  $: scheduler = data.scheduler.data.map((obj) => {
    return {
      id: obj.id,
      weekday: obj.weekday,
      period: obj.start,
      size: obj.end - obj.start + 1,
      section: obj.section,
    };
  });

  let instructor = data.section.data.reduce<
    Omit<API.Instructor, 'createdAt' | 'createdBy' | 'updatedAt' | 'updatedBy'>[] // eslint-disable-line no-undef
  >((acc, curr) => {
    return acc
      .concat(curr.instructor)
      .filter((a, idx, arr) => arr.findIndex((b) => b.id === a.id) === idx);
  }, []);

  let room = data.section.data.reduce<
    Omit<API.Room, 'createdAt' | 'createdBy' | 'updatedAt' | 'updatedBy'>[] // eslint-disable-line no-undef
  >((acc, curr) => {
    return acc
      .concat(curr.room ?? [])
      .filter((a, idx, arr) => arr.findIndex((b) => b.id === a.id) === idx);
  }, []);

  let group = data.section.data.reduce<
    Omit<API.Group, 'createdAt' | 'createdBy' | 'updatedAt' | 'updatedBy'>[] // eslint-disable-line no-undef
  >((acc, curr) => {
    return acc
      .concat(curr.group ?? [])
      .filter((a, idx, arr) => arr.findIndex((b) => b.id === a.id) === idx);
  }, []);

  let state: ComponentProps<Table>['state'] = {
    period: 0,
    size: 0,
    weekday: 'sun',
    section: data.section.data[4],
    selected: false,
    status: true,
  };

  async function handleKeydown(e: KeyboardEvent) {
    let confirmOverlap = false;

    switch (e.key) {
      case 'Enter':
        if (!state.section) return;

        if (!state.status && state.period + state.size - 1 > 25)
          return alert('Overflowed!!! Not Allowed.');

        if (!state.status && !state.allowOverlap) return alert('Overlap Detected!!! Not Allowed.');

        if (!state.status) confirmOverlap = confirm('Overlap Detected!!! Do you want to continue?');

        if (!state.status && !confirmOverlap) return;

        await createScheduler({
          weekday: state.weekday,
          start: state.period,
          end: state.period + state.size - 1,
          sectionId: state.section.id,
        });

        await invalidate('data:scheduler');

        state = {
          period: 0,
          size: 0,
          weekday: 'sun',
          section: null,
          selected: false,
          status: true,
        };
        break;
      case 'Escape':
        state.section = null;
        break;
    }
  }
</script>

<svelte:window on:keydown="{handleKeydown}" />

<div class="flex">
  <div class="flex-grow">
    <div>
      <div class="z-20 grid grid-cols-2 shadow">
        <div class="table-small-container border-b border-r">
          {#each instructor as i (i.id)}
            <div id="inst-{i.id}" class="p-4">
              <h6 class="text-center font-semibold">Instructor - {i.name}</h6>
              <Table
                bind:data="{scheduler}"
                bind:state="{state}"
                small="{true}"
                selectable="{true}"
                instructor="{i}"
              />
            </div>
          {/each}
        </div>
        <div class="table-small-container border-b">
          {#each room as r (r.id)}
            <div id="room-{r.id}" class="p-4">
              <h6 class="text-center font-semibold">Room - {r.building.code}-{r.name}</h6>
              <Table
                bind:data="{scheduler}"
                bind:state="{state}"
                small="{true}"
                selectable="{true}"
                room="{r}"
              />
            </div>
          {/each}
        </div>
      </div>
      <div class="main-table-container">
        {#each group as g (g.id)}
          <div id="group-{g.id}" class="p-4">
            <h6 class="text-center font-semibold">Group - {g.name}</h6>
            <Table bind:data="{scheduler}" bind:state="{state}" selectable="{true}" group="{g}" />
          </div>
        {/each}
      </div>
    </div>
  </div>
  <div>
    <div class="section-selector">
      {#each data.section.data as section}
        {@const used = scheduler.findIndex((sched) => sched.section.id === section.id) !== -1}
        <div>
          <button
            class="section-button"
            class:text-red-500="{used}"
            on:click="{() => {
              if (!used) state.section = section;
            }}"
          >
            {section.no} | {section.subject.code}
            {section.subject.name}
          </button>
        </div>
      {/each}
    </div>
  </div>
</div>

<style lang="postcss">
  .table-small-container {
    height: calc(169px + 1rem + 1.5rem + 1rem);
    overflow-y: auto;
  }

  .table-small-container > *:not(:last-child) {
    margin-bottom: 1rem;
  }

  .main-table-container {
    height: calc(100vh - 4rem - (169px + 1rem + 1.5rem + 1rem));
    overflow-y: auto;
  }

  .section-selector {
    padding: 1rem;
    width: 24rem;
    height: calc(100vh - 4rem);
    overflow-y: auto;
  }
</style>
