<script lang="ts">
  import { onMount, type ComponentProps, onDestroy } from 'svelte';
  import type { PageData } from './$types';
  import Table from './Table.svelte';
  import { createScheduler } from '$lib/api/scheduler';
  import { invalidate } from '$app/navigation';
  import { checkOverlap } from './utils';
  import { generate } from './generate';
  import toast from 'svelte-french-toast';
  import { PUBLIC_API_WS } from '$env/static/public';

  export let data: PageData;

  let ws: WebSocket;

  onMount(() => {
    ws = new WebSocket(PUBLIC_API_WS);

    ws.onopen = () => console.log('WebSocket Connected.');

    ws.onmessage = (event) => {
      if (event.data === 'Schedule updated.') invalidate('data:scheduler');
    };

    ws.onclose = () => console.log('WebSocket Closed');
  });

  onDestroy(() => {
    ws.close();
  });

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

    // if (state.isOverlap) {
    //   if (state.overlapRoom.length > 0)
    //     toast.error('Overlap Room: ' + state.overlapRoom[0].section?.room?.name ?? '');
    //   if (state.overlapInstructor.length > 0)
    //     toast.error(
    //       'Overlap Instructor: ' +
    //         state.overlapInstructor[0].section?.instructor.map((inst) => inst.name).toString()!,
    //     );
    //   if (state.overlapGroup.length > 0)
    //     toast.error('Overlap Group: ' + state.overlapGroup[0].section?.group?.name ?? '');
    //   if (state.overlapSubject.length > 0)
    //     toast.error('Overlap Subject: ' + state.overlapSubject[0].section?.subject.name ?? '');
    // }
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

        // await invalidate('data:scheduler');

        resetState();
        break;
      case 'Escape':
        resetState();
        break;
      case 'ArrowDown':
        if (state.selected) e.preventDefault();
        if (state.size > 1) state.size = state.size - 1;
        break;
      case 'ArrowUp':
        if (state.selected) e.preventDefault();
        if (state.size < leftOverHours * 2) state.size = state.size + 1;
        break;
    }
  }

  // eslint-disable-next-line no-undef
  function getRequiredHour(section: API.Section | API.Section['child'][number]) {
    return section.type === 'lecture' ? section.subject.lecture : section.subject.lab;
  }

  // eslint-disable-next-line no-undef
  function getUsedHour(section: API.Section | API.Section['child'][number]) {
    return scheduler
      .filter((sched) => sched.section.id === section.id)
      .reduce((acc, curr) => acc + curr.size / 2, 0);
  }

  // eslint-disable-next-line no-undef
  function getLeftOverHours(section: API.Section | API.Section['child'][number]) {
    return getRequiredHour(section) - getUsedHour(section);
  }

  // eslint-disable-next-line no-undef
  function handleSelectSection(section: API.Scheduler['section']) {
    let left = getLeftOverHours(section);

    if (left > 0) {
      state.selected = true;
      state.section = section;
      state.size = left * 2;

      leftOverHours = left;

      handleDataChange();
    }
  }
</script>

<svelte:window on:keydown="{handleKeydown}" />

<div class="flex">
  <div class="flex-grow">
    <div>
      <div class="z-20 grid grid-cols-2">
        <div class="table-small-container border-b border-r">
          {#if pov === 'group'}
            {#each instructor as i (i.id)}
              <div id="inst-{i.id}" class="p-4 pr-2" style:scroll-gutter="stable">
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
          {:else}
            {#each group as g (g.id)}
              <div id="group-{g.id}" class="p-4 pr-2" style:scroll-gutter="stable">
                <h6 class="text-center font-semibold">Group - {g.name}</h6>
                <Table
                  bind:data="{scheduler}"
                  bind:state="{state}"
                  on:select="{(e) => handleSelect(e.detail.weekday, e.detail.period)}"
                  small="{true}"
                  selectable="{true}"
                  group="{g}"
                />
              </div>
            {/each}
          {/if}
        </div>
        <div class="table-small-container border-b">
          {#each room as r (r.id)}
            <div id="room-{r.id}" class="p-4 pr-2" style:scroll-gutter="stable">
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
        {#if data.section.total === 0}
          <div class="p-8 text-center">
            <h1 class="mb-4 text-5xl font-extrabold">No Data</h1>
            <h2 class="text-secondary text-3xl">
              No section created.<br />Must have section data in order for timetable to show.
            </h2>
          </div>
        {/if}

        {#if pov === 'group'}
          {#each group as g (g.id)}
            <div id="group-{g.id}" class="p-4 pr-2" style:scroll-gutter="stable">
              <h6 class="text-center font-semibold">Group - {g.name}</h6>
              <Table
                bind:data="{scheduler}"
                bind:state="{state}"
                on:select="{(e) => handleSelect(e.detail.weekday, e.detail.period)}"
                selectable="{true}"
                group="{g}"
              />
            </div>
            <div class="mb-3 flex w-full justify-end">
              <button
                class="button mx-2 flex h-12 w-48 items-center justify-center rounded"
                on:click="{async () => {
                  await generate(data.section.data, scheduler);
                  // await invalidate('data:scheduler');
                  resetState();
                }}">Generate</button
              >
            </div>
          {/each}
        {:else}
          {#each instructor as i (i.id)}
            <div id="inst-{i.id}" class="p-4 pr-2" style:scroll-gutter="stable">
              <h6 class="text-center font-semibold">Instructor - {i.name}</h6>
              <Table
                bind:data="{scheduler}"
                bind:state="{state}"
                on:select="{(e) => handleSelect(e.detail.weekday, e.detail.period)}"
                selectable="{true}"
                instructor="{i}"
              />
            </div>
          {/each}
        {/if}
      </div>
    </div>
  </div>
  <div>
    <div class="section-selector bg-light border-l">
      {#each data.section.data as section}
        {#if section.parent === null}
          <div class="w-full space-y-2 border-b p-4">
            <div class="mb-2 space-y-2 text-sm">
              <div class="flex gap-2">
                <span class="bg-primary inline-block flex items-center rounded px-2 py-1 font-semibold text-white">
                  {section.subject.code}
                </span>
                <span class="bg-primary inline-block flex items-center rounded px-2 py-1 font-semibold text-white">
                  {section.subject.name}
                </span>
              </div>

              <div class="flex gap-2">
                <span class="bg-primary inline-block flex items-center rounded px-2 py-1 font-semibold text-white">
                  SEC {section.no}
                </span>
                <span class="bg-primary inline-block flex items-center rounded px-2 py-1 font-semibold text-white">
                  {section.group?.name ?? 'Any'}
                </span>
              </div>
            </div>
            <button
              class="block grid w-full grid-cols-4 flex-row rounded border capitalize outline-none"
              class:bg-white="{state.section?.id !== section.id}"
              class:bg-green-600="{state.section?.id === section.id}"
              class:text-white="{state.section?.id === section.id}"
              class:text-red-600="{getLeftOverHours(section) == 0}"
              class:text-indigo-600="{getUsedHour(section) > 0 &&
                getUsedHour(section) < getRequiredHour(section) &&
                state.section?.id != section.id}"
              on:click="{() => handleSelectSection(section)}"
            >
              <div
                class="flex h-full w-full items-center justify-center rounded-l border-r font-semibold"
              >
                <small>
                  {section.type}
                  {section.lab ?? ''}
                </small>
              </div>
              <div class="col-span-3 w-full pl-3 text-left font-semibold">
                {#each section.instructor as instructor}
                  <small>{instructor.name}</small><br />
                {/each}
              </div>
            </button>

            {#each section.child as child}
              <button
                class="block grid w-full grid-cols-4 flex-row rounded border capitalize outline-none"
                class:bg-white="{state.section?.id !== child.id}"
                class:bg-green-600="{state.section?.id === child.id}"
                class:text-white="{state.section?.id === child.id}"
                class:text-red-600="{getLeftOverHours(child) == 0}"
                class:text-indigo-700="{getUsedHour(child) > 0 &&
                  getUsedHour(child) < getRequiredHour(child) &&
                  state.section?.id != child.id}"
                on:click="{() => handleSelectSection({ ...child, child: [] })}"
              >
                <div
                  class="flex h-full w-full items-center justify-center rounded-l border-r font-semibold"
                >
                  <small>
                    {child.type}
                    {child.lab ?? ''}
                  </small>
                </div>
                <div class="col-span-3 w-full pl-3 text-left font-semibold">
                  {#each child.instructor as instructor}
                    <small>{instructor.name}</small><br />
                  {/each}
                </div>
              </button>
            {/each}
          </div>
        {/if}
      {/each}
    </div>
  </div>
</div>
<div class="flex h-16 overflow-hidden items-center justify-between border p-4">
  <div class="pov-switch pr-4">
    <button
      on:click="{() => (pov = pov === 'group' ? 'instructor' : 'group')}"
      class="w-48 rounded border bg-slate-900 px-4 py-2 font-semibold text-white outline-none transition duration-150 focus:bg-slate-800"
    >
      View: <span class="capitalize">{pov}</span>
    </button>
  </div>
  {#if state.section}
    <div
      class="border-primary bg-light flex flex justify-between gap-2 overflow-hidden rounded border font-semibold shadow"
    >
      <span class="bg-primary px-3 py-2 font-semibold text-white">Selected</span>
      <span class="px-4 py-2 truncate">
        {state.section?.subject.code ?? ''}
        {state.section?.subject.name ?? ''}
      </span>
      <span class="px-4 py-2">{state.section?.group?.name ?? ''}</span>
      <span class="px-4 py-2 whitespace-nowrap">SEC {state.section?.no ?? ''}</span>
      <span class="px-4 py-2 whitespace-nowrap capitalize">{state.section?.type} {state.section?.lab ?? ''}</span>
    </div>
  {/if}

  <div class="alloc-control">
    <div class="bg-primary grid grid-cols-6 rounded font-semibold text-white">
      <div class="col-span-5 flex items-center px-4 py-2">
        <input
          class="w-full"
          type="range"
          min="1"
          max="{leftOverHours * 2}"
          disabled="{state.section === null}"
          on:change="{() => handleDataChange()}"
          bind:value="{state.size}"
        />
      </div>
      <div class="col-span-1 px-4">
        <span class="block py-2 text-center">
          {state.size}
        </span>
      </div>
    </div>
  </div>
</div>

<style lang="postcss">
  .table-small-container {
    height: calc(193px + 1rem + 1.5rem + 1rem);
    overflow-y: auto;
  }

  .main-table-container {
    height: calc(100vh - 4rem - 4rem - (193px + 1rem + 1.5rem + 1rem));
    overflow-y: auto;
  }

  .section-selector {
    height: calc(100vh - 4rem - 4rem);
    overflow-x: hidden;
    overflow-y: auto;
    scrollbar-gutter: stable;
    width: 22.5rem;
  }

  .section-selector button {
    width: 20rem;
    user-select: none;
  }

  .alloc-control {
    padding-left: 1rem;
    padding-right: 0.5rem;
  }

  .alloc-control > .grid {
    width: 20rem;
  }
</style>
