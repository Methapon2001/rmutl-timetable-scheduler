<script lang="ts">
  import type { ComponentProps } from 'svelte';
  import type { PageData } from './$types';
  import Table from './Table.svelte';
  import { createScheduler } from '$lib/api/scheduler';
  import { invalidate } from '$app/navigation';
  import { checkOverlap } from './utils';

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
    selected: false,
    section: null,
    weekday: 'mon',
    period: 1,
    size: 1,
  };

  let pov: 'instructor' | 'group' = 'group';
  let allocInput: HTMLInputElement;
  let leftOverHours = 0;

  function resetState() {
    state = {
      period: 1,
      size: 1,
      weekday: 'mon',
      section: null,
      selected: false,
    };
  }

  function handleSelect(weekday: ComponentProps<Table>['state']['weekday'], period: number) {
    if (!state.section) return;

    state.selected = Boolean(state.section);
    state.weekday = weekday;
    state.period = period;

    handleDataChange();
  }

  function handleDataChange() {
    state.isOverflow = state.period + state.size - 1 > 25;

    const {
      isOverlap,
      allowOverlap,
      overlapGroup,
      overlapInstructor,
      overlapRoom,
      overlapSubject,
    } = checkOverlap(state, scheduler);

    state.isOverlap = isOverlap;
    state.allowOverlap = allowOverlap;
    state.overlapGroup = overlapGroup;
    state.overlapInstructor = overlapInstructor;
    state.overlapRoom = overlapRoom;
    state.overlapSubject = overlapSubject;
  }

  async function handleKeydown(e: KeyboardEvent) {
    let confirmOverlap = false;

    switch (e.key) {
      case 'Enter':
        if (!state.section) return;
        if (state.isOverflow) return alert('Overflowed!!! Not Allowed.');
        if (state.isOverlap && !state.allowOverlap)
          return alert('Overlap Detected!!! Not Allowed.');
        if (state.isOverlap)
          confirmOverlap = confirm('Overlap Detected!!! Do you want to continue?');
        if (state.isOverlap && !confirmOverlap) return;

        await createScheduler({
          weekday: state.weekday,
          start: state.period,
          end: state.period + state.size - 1,
          sectionId: state.section.id,
        });

        await invalidate('data:scheduler');

        resetState();
        break;
      case 'Escape':
        resetState();
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
                on:select="{(e) => handleSelect(e.detail.weekday, e.detail.period)}"
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
                on:select="{(e) => handleSelect(e.detail.weekday, e.detail.period)}"
                small="{true}"
                selectable="{true}"
                room="{r}"
              />
            </div>
          {/each}
        </div>
      </div>
      <div class="main-table-container">
        <!-- <button
          class="button"
          on:click="{async () => {
            scheduler = await generate(data.section.data, scheduler);

            state = {
              selected: false,
              section: null,
              weekday: 'mon',
              period: 1,
              size: 1,
            };
          }}">Generate</button
        > -->

        {#each group as g (g.id)}
          <div id="group-{g.id}" class="p-4">
            <h6 class="text-center font-semibold">Group - {g.name}</h6>
            <Table
              bind:data="{scheduler}"
              bind:state="{state}"
              on:select="{(e) => handleSelect(e.detail.weekday, e.detail.period)}"
              selectable="{true}"
              group="{g}"
            />
          </div>
        {/each}
      </div>
    </div>
  </div>
  <div>
    <div class="section-selector space-y-2">
      {#each data.section.data as section}
        {@const requiredHour =
          section.type === 'lecture' ? section.subject.lecture : section.subject.lab}
        {@const usedHour = scheduler
          .filter((sched) => sched.section.id === section.id)
          .reduce((acc, curr) => acc + curr.size / 2, 0)}
        <button
          class="bg-light block rounded p-2 capitalize shadow"
          class:text-green-600="{state.section?.id === section.id}"
          class:text-red-600="{requiredHour - usedHour === 0}"
          class:text-indigo-800="{usedHour > 0 && usedHour < requiredHour}"
          on:click="{() => {
            leftOverHours = requiredHour - usedHour;

            if (leftOverHours > 0) {
              state.selected = true;
              state.section = section;
              state.size = leftOverHours * 2;

              handleDataChange();

              allocInput.focus();
            }
          }}"
        >
          {section.no}
          {section.type}
          {section.lab ?? ''}<br />
          {section.subject.code}
          {section.subject.name}
        </button>
      {/each}

      <div class="mt-4">
        Allocate Size:
        <input
          class="input"
          type="number"
          min="1"
          max="{leftOverHours * 2}"
          disabled="{state.section === null}"
          bind:this="{allocInput}"
          on:change="{() => handleDataChange()}"
          bind:value="{state.size}"
        />
      </div>
    </div>
  </div>
</div>

<style lang="postcss">
  .table-small-container {
    height: calc(193px + 1rem + 1.5rem + 1rem);
    overflow-y: auto;
  }

  .table-small-container > *:not(:last-child) {
    margin-bottom: 1rem;
  }

  .main-table-container {
    height: calc(100vh - 4rem - (193px + 1rem + 1.5rem + 1rem));
    overflow-y: auto;
  }

  .section-selector {
    padding: 1rem;
    height: calc(100vh - 4rem);
    overflow-y: auto;
  }

  .section-selector > * {
    width: 22rem;
  }
</style>
