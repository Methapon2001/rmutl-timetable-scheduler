<script lang="ts">
  import type { PageData } from './$types';
  import { PUBLIC_API_WS } from '$env/static/public';
  import { onMount, type ComponentProps, onDestroy } from 'svelte';
  import { createSchedulerExam } from '$lib/api/scheduler-exam';
  import { invalidate } from '$app/navigation';
  import toast from 'svelte-french-toast';
  import { checkOverlap } from './utils';
  import Table from './Table.svelte';

  export let data: PageData;

  let ws: WebSocket;

  onMount(() => {
    ws = new WebSocket(PUBLIC_API_WS);

    ws.onopen = () => console.log('WebSocket Connected.');

    ws.onmessage = (event) => {
      if (event.data === 'Schedule exam updated.') invalidate('data:scheduler-exam');
    };

    ws.onclose = () => console.log('WebSocket Closed');
  });

  onDestroy(() => {
    ws.close();
  });

  let schedulerExam: ComponentProps<Table>['data'];

  $: schedulerExam = data.schedulerExam.data.map((obj) => {
    return {
      id: obj.id,
      weekday: obj.weekday,
      period: obj.start,
      size: obj.end - obj.start + 1,
      exam: obj.exam,
    };
  });

  let instructor = data.exam.data.reduce<
    Omit<API.Instructor, 'createdAt' | 'createdBy' | 'updatedAt' | 'updatedBy'>[] // eslint-disable-line no-undef
  >((acc, curr) => {
    return acc
      .concat(curr.instructor)
      .filter((a, idx, arr) => arr.findIndex((b) => b.id === a.id) === idx);
  }, []);

  let room = data.exam.data.reduce<
    Omit<API.Room, 'createdAt' | 'createdBy' | 'updatedAt' | 'updatedBy'>[] // eslint-disable-line no-undef
  >((acc, curr) => {
    return acc
      .concat(curr.room ?? [])
      .filter((a, idx, arr) => arr.findIndex((b) => b.id === a.id) === idx);
  }, []);

  let group = data.exam.data.reduce<
    Omit<API.Group, 'createdAt' | 'createdBy' | 'updatedAt' | 'updatedBy'>[] // eslint-disable-line no-undef
  >((acc, curr) => {
    let grp = curr.section
      .map((sec) => sec.group)
      .filter(
        (
          g,
        ): g is Omit<API.Group, 'createdAt' | 'createdBy' | 'updatedAt' | 'updatedBy'> => // eslint-disable-next-line no-undef
          g !== null,
      );

    return acc.concat(grp).filter((a, idx, arr) => arr.findIndex((b) => b.id === a.id) === idx);
  }, []);

  let state: ComponentProps<Table>['state'] = {
    selected: false,
    exam: null,
    weekday: 'mon',
    period: 1,
    size: 1,
  };

  let pov: 'instructor' | 'group' = 'group';

  function resetState() {
    state = {
      period: 1,
      size: 1,
      weekday: 'mon',
      exam: null,
      selected: false,
    };
  }

  function handleSelect(weekday: ComponentProps<Table>['state']['weekday'], period: number) {
    if (!state.exam) return;

    state.selected = Boolean(state.exam);
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
      overlapSection,
    } = checkOverlap(state, schedulerExam);

    state.isOverlap = isOverlap;
    state.allowOverlap = allowOverlap;
    state.overlapGroup = overlapGroup;
    state.overlapInstructor = overlapInstructor;
    state.overlapRoom = overlapRoom;
    state.overlapSection = overlapSection;

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
        if (!state.exam) return;
        if (state.isOverflow) return alert('Overflowed!!! Not Allowed.');
        if (state.isOverlap && !state.allowOverlap)
          return alert('Overlap Detected!!! Not Allowed.');
        if (state.isOverlap)
          confirmOverlap = confirm('Overlap Detected!!! Do you want to continue?');
        if (state.isOverlap && !confirmOverlap) return;

        await createSchedulerExam({
          weekday: state.weekday,
          start: state.period,
          end: state.period + state.size - 1,
          examId: state.exam.id,
        });

        // await invalidate('data:scheduler');

        resetState();
        break;
      case 'Escape':
        resetState();
        break;
    }
  }

  // eslint-disable-next-line no-undef
  function handleSelectExam(exam: API.SchedulerExam['exam']) {
    if (!exam.instructor && !exam.section.filter(() => group != null)) {
      toast.error('Section must assign at least one instructor or one group.', {
        duration: 7500,
      });
      return;
    }

    if (pov === 'group' && !exam.section.filter(() => group != null)) {
      toast.error('Selected group pov but section is not assigned to any group.', {
        duration: 7500,
      });
      return;
    }

    if (pov === 'instructor' && exam.instructor.length === 0) {
      toast.error('Selected instructor pov but no instructor is assigned to section.', {
        duration: 7500,
      });
      return;
    }

    state.selected = true;
    state.exam = exam;
    state.size = exam.section[0].subject.exam * 2;

    handleDataChange();

    if (pov === 'group') {
      document.querySelector(`#group-${state.exam?.section[0].group?.id}`)?.scrollIntoView({
        behavior: 'smooth',
      });
    } else {
      document.querySelector(`#inst-${state.exam?.instructor[0].id}`)?.scrollIntoView({
        behavior: 'smooth',
      });
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
            {#each instructor.filter((obj) => state.exam?.instructor.findIndex((inst) => inst.id == obj.id) !== -1) as i (i.id)}
              <div id="inst-{i.id}" class="p-4 pr-2" style:scroll-gutter="stable">
                <h6 class="text-center font-semibold">Instructor - {i.name}</h6>
                <Table
                  bind:data="{schedulerExam}"
                  bind:state="{state}"
                  on:select="{(e) => handleSelect(e.detail.weekday, e.detail.period)}"
                  small="{true}"
                  selectable="{true}"
                  instructor="{i}"
                />
              </div>
            {/each}
          {:else}
            {#each group.filter((obj) => state.exam?.section.findIndex((grp) => grp.id == obj.id) !== -1) as g (g.id)}
              <div id="group-{g.id}" class="p-4 pr-2" style:scroll-gutter="stable">
                <h6 class="text-center font-semibold">Group - {g.name}</h6>
                <Table
                  bind:data="{schedulerExam}"
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
          {#each room.filter((obj) => !state.selected || obj.id === state.exam?.room?.id) as r (r.id)}
            <div id="room-{r.id}" class="p-4 pr-2" style:scroll-gutter="stable">
              <h6 class="text-center font-semibold">Room - {r.building.code}-{r.name}</h6>
              <Table
                bind:data="{schedulerExam}"
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
        {#if data.exam.total === 0}
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
                bind:data="{schedulerExam}"
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
                  //   await generate(data.section.data, scheduler);
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
                bind:data="{schedulerExam}"
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
      {#each data.exam.data as exam}
        <div class="w-full space-y-2 border-b p-4">
          <div class="mb-2 space-y-2 text-sm">
            <div class="flex gap-2">
              <span
                class="bg-primary inline-block flex items-center rounded px-2 py-1 font-semibold text-white"
              >
                {exam.section[0].subject.code}
              </span>
              <span
                class="bg-primary inline-block flex items-center rounded px-2 py-1 font-semibold text-white"
              >
                {exam.section[0].subject.name}
              </span>
            </div>
            <div class="flex gap-2">
              {#each exam.section as sec}
                <span
                  class="bg-primary inline-block flex items-center rounded px-2 py-1 font-semibold text-white"
                >
                  SEC {sec.no}
                </span>
              {/each}
            </div>
          </div>
          <button
            class="block grid w-full grid-cols-4 flex-row rounded border px-2 py-2 text-left text-sm font-semibold capitalize outline-none"
            class:bg-white="{state.exam?.id !== exam.id}"
            class:bg-green-600="{state.exam?.id === exam.id}"
            class:text-white="{state.exam?.id === exam.id}"
            class:text-red-600="{schedulerExam.findIndex((sched) => exam.id == sched.exam.id) !==
              -1}"
            on:click="{() => handleSelectExam(exam)}"
          >
            <div
              class="flex h-full w-full items-center justify-center rounded-l border-r font-semibold"
            >
              {exam.room?.building.code ?? ''}-{exam.room?.name ?? ''}
            </div>
            <div class="col-span-3 w-full pl-3 text-left font-semibold">
              {#each exam.instructor as inst}
                {inst.name}<br />
              {/each}
            </div>
          </button>
        </div>
      {/each}
    </div>
  </div>
</div>
<div class="flex h-16 items-center justify-between overflow-hidden border p-4">
  <div class="pov-switch pr-4">
    <button
      on:click="{() => {
        pov = pov === 'group' ? 'instructor' : 'group';
        resetState();
      }}"
      class="w-48 rounded border bg-slate-900 px-4 py-2 font-semibold text-white outline-none transition duration-150 focus:bg-slate-800"
    >
      View: <span class="capitalize">{pov}</span>
    </button>
  </div>
  {#if state.exam}
    <div
      class="border-primary bg-light flex flex justify-between gap-2 overflow-hidden rounded border font-semibold shadow"
    >
      <span class="bg-primary px-3 py-2 font-semibold text-white">Selected</span>
      <span class="truncate px-4 py-2">
        {state.exam?.section[0].subject.code ?? ''}
        {state.exam?.section[0].subject.name ?? ''}
      </span>
      <span class="px-4 py-2">
        SEC
        {#each state.exam.section as sec}
          _{sec.no ?? ''}
        {/each}
      </span>
    </div>
  {/if}
</div>

<style lang="postcss">
  .table-small-container {
    height: calc(193px + 1rem + 1.5rem + 1rem);
    overflow-y: auto;
    scrollbar-gutter: stable;
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
</style>
