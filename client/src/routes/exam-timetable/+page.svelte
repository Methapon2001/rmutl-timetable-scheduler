<script lang="ts">
  import type { PageData } from './$types';
  import { onMount, type ComponentProps, onDestroy, tick } from 'svelte';
  import toast from 'svelte-french-toast';
  import autoTable from 'jspdf-autotable';

  import { resetData } from '$lib/api/reset';
  import { invalidate, invalidateAll } from '$app/navigation';
  import { checkOverlap } from './utils';
  import { generate } from './generate';

  import { exportScheduleExam } from '$lib/api/export-data';

  import viewport from '$lib/element';
  import apiRequest, { getWebsocketURL } from '$lib/api';

  import Modal from '$lib/components/Modal.svelte';
  import Form from '../exam/ExamForm.svelte';
  import ShowInstructor from './ShowInstructor.svelte';
  import ShowRoom from './ShowRoom.svelte';

  import Filter from './Filter.svelte';
  import FilterIcon from '$lib/icons/FilterIcon.svelte';
  import Table from './Table.svelte';

  export let data: PageData;

  let ws: WebSocket | undefined = undefined;

  function initWebSocket() {
    ws = new WebSocket(getWebsocketURL());
    ws.addEventListener('open', () => {
      console.log('WebSocket Connected.');
    });
    ws.addEventListener('message', (event) => {
      if (JSON.parse(event.data).update === 2) {
        console.log('[WS] Data change detected, syncing data...');
        invalidate('data:scheduler-exam');
      }
    });
    ws.addEventListener('close', () => {
      console.log('WebSocket Closed');
    });
  }

  onMount(initWebSocket);
  onDestroy(() => ws?.close());

  $: isPublish = data.schedulerExam.data.some((sched) => {
    return sched.createdBy.id === data.session?.user.id && sched.publish === true;
  });

  let schedulerExam: ComponentProps<Table>['data'] = [];

  $: schedulerExam = data.schedulerExam.data;
  $: instructor = Object.values(
    data.exam.data.reduce<Record<string, (typeof data.exam.data)[number]['instructor'][number]>>(
      (acc, curr) => {
        curr.instructor.forEach((inst) => {
          if (!acc[`${inst.id}`]) acc[`${inst.id}`] = inst;
        });
        return acc;
      },
      {},
    ),
  );

  $: room = Object.values(
    data.exam.data.reduce<Record<string, NonNullable<(typeof data.exam.data)[number]['room']>>>(
      (acc, curr) => {
        if (curr.room && !acc[`${curr.room.id}`]) {
          acc[`${curr.room.id}`] = curr.room;
        }
        return acc;
      },
      {},
    ),
  );

  $: group = Object.values(
    data.exam.data.reduce<
      Record<string, NonNullable<(typeof data.exam.data)[number]['section'][number]['group']>>
    >((acc, curr) => {
      curr.section.forEach((v) => {
        if (v.group && !acc[`${v.group.id}`]) {
          acc[`${v.group.id}`] = v.group;
        }
      });
      return acc;
    }, {}),
  );

  let state: ComponentProps<Table>['state'] = {
    selected: false,
    exam: null,
    weekday: 'mon',
    period: 1,
    size: 1,
  };

  function resetState() {
    let currentRoom = state.exam?.room;
    let currentInst = state.exam?.instructor;
    let currentGroup = state.exam?.section.map((v) => v.group).filter((v) => v !== null);
    state = {
      period: 1,
      size: 1,
      weekday: 'mon',
      exam: null,
      selected: false,
    };

    tick().then(() => {
      if (currentRoom)
        document.getElementById(`room-${currentRoom.id}`)?.scrollIntoView({ block: 'nearest' });
      if (currentInst && currentInst.length > 0)
        document.getElementById(`inst-${currentInst[0].id}`)?.scrollIntoView({ block: 'nearest' });
      if (currentGroup && currentGroup.length > 0)
        document
          .getElementById(`group-${currentGroup[0]!.id}`)
          ?.scrollIntoView({ block: 'nearest' });
    });
  }

  function handleSelect(weekday: ComponentProps<Table>['state']['weekday'], period: number) {
    if (!state.exam) return;

    state.selected = Boolean(state.exam);
    state.weekday = weekday;
    state.period = period;

    detectOverlap();
  }

  function detectOverlap() {
    state.isOverflow = state.period + state.size - 1 > 50;

    const { isOverlap, overlapGroup, overlapInstructor, overlapRoom, overlapSection } =
      checkOverlap(state, schedulerExam);

    state.isOverlap = isOverlap;
    state.overlapGroup = overlapGroup;
    state.overlapInstructor = overlapInstructor;
    state.overlapRoom = overlapRoom;
    state.overlapSection = overlapSection;
  }

  async function submitData() {
    if (!state.exam) return;
    if (state.isOverlap) return alert('Overlap Detected!!! Not Allowed.');

    if (ws?.readyState !== WebSocket.OPEN) {
      initWebSocket();
    }

    await apiRequest('/api/scheduler-exam').post({
      weekday: state.weekday,
      start: state.period,
      end: state.period + state.size - 1,
      examId: state.exam.id,
      publish: false,
    });

    resetState();
  }

  async function handleKeydown(e: KeyboardEvent) {
    switch (e.key) {
      case 'Enter':
        await submitData();
        break;
      case 'Escape':
        resetState();
        break;
    }
  }

  type ExamArg = NonNullable<(typeof state)['exam']>;

  function handleSelectExam(exam: ExamArg) {
    if (isPublish) {
      toast.error('Data is published, Cannot edit.');
      return false;
    }

    if (schedulerExam.findIndex((v) => v.exam.id === exam.id) !== -1) return;

    if (!exam.room === null) {
      toast.error('Exam must assign at least one room.', {
        duration: 7500,
      });
      return false;
    }

    let inputPrompt = 0;

    if (exam.section[0]?.subject.lecture === 0) {
      inputPrompt = Number(
        prompt('This subject does not have lecture hour. \nPlease input exam hour: '),
      );
    } else {
      inputPrompt = exam.section[0]?.subject.lecture;
    }

    if (inputPrompt === 0) return false;

    state.selected = true;
    state.exam = exam;

    state.size = inputPrompt * 4;

    detectOverlap();

    return true;
  }

  let midDateExam: string;
  let finalDateExam: string;

  let showFilter = false;
  let filterSelected: string[] = [];

  $: filterList = [
    {
      group: 'Group',
      options:
        group?.map((grp) => ({
          value: grp.name,
          label: grp.name,
        })) ?? [],
    },
    {
      group: 'Instructor',
      options:
        instructor?.map((inst) => ({
          value: inst.name,
          label: inst.name,
        })) ?? [],
    },
  ];

  let showState = false;
  let maxPerDay = 2;

  let searchText = '';

  $: filteredExam = data.exam.data.filter((sec) => {
    const filterFn = (text: string) =>
      sec.section.some(
        (sec) =>
          sec.subject.name.toLocaleLowerCase().includes(text.toLocaleLowerCase()) ||
          sec.group?.name.toLocaleLowerCase().includes(text.toLocaleLowerCase()) ||
          sec.subject.name.toLocaleLowerCase().includes(text.toLocaleLowerCase()),
      ) ||
      sec.instructor.some((ins) => ins.name.toLocaleLowerCase().includes(text.toLocaleLowerCase()));

    if (filterSelected.length > 0 && !filterSelected.some((txt) => filterFn(txt))) {
      return false;
    }

    return filterFn(searchText);
  });

  let newState = false;
  let editState = false;

  let currentData: {
    id: string;
    section: string[];
    instructor: string[];
    roomId: string;
  };

  function triggerEdit(exam: typeof currentData) {
    editState = true;
    currentData = exam;
  }

  let showRoomState = false;
  let showInstructorState = false;
  let showExportState = false;
  let tableSelectState: string;

  async function handleDelete(id: string) {
    const currentSched = schedulerExam.find((v) => v.id === id);
    const ret = await apiRequest('/api/scheduler-exam')
      .delete({ id })
      .catch((e) => console.error(e));

    if (!ret) return toast.error('Failed to delete. \nSee console for more info.');

    await invalidate('data:scheduler-exam');

    if (currentSched) {
      handleSelectExam(currentSched.exam);
      state.weekday = currentSched.weekday;
      state.period = currentSched.start;
    }
  }
</script>

<svelte:window on:keydown="{handleKeydown}" />

<div class="flex">
  <div class="flex-grow">
    <div class="relative">
      <div class="z-20 grid grid-cols-2">
        <div class="table-small-container border-b border-r">
          {#each instructor.filter((obj) => state.exam?.instructor.findIndex((inst) => inst.id == obj.id) !== -1) as i (i.id)}
            <div id="inst-{i.id}" class="p-4 pr-2" style:scrollbar-gutter="stable">
              <div class="mb-2 flex justify-between">
                <h6 class="font-semibold">Instructor - {i.name}</h6>
                <button
                  class="rounded bg-primary px-2 font-semibold text-white"
                  on:click="{() => (showInstructorState = true)}">View All</button
                >
              </div>
              <Table
                bind:data="{schedulerExam}"
                bind:state="{state}"
                on:select="{(e) => handleSelect(e.detail.weekday, e.detail.period)}"
                on:remove="{(e) => handleDelete(e.detail.id)}"
                small="{true}"
                noDelete="{isPublish}"
                selectable="{true}"
                instructor="{i}"
              />
            </div>
          {/each}
          {#if state.exam && !state.exam.instructor.length}
            <div class="flex h-full w-full items-center justify-center">
              <button
                class="rounded bg-primary p-2 font-semibold text-white"
                on:click="{() => (showInstructorState = true)}">Select Instructor</button
              >
            </div>
          {/if}
        </div>
        <div class="table-small-container border-b">
          {#each group as g (g.id)}
            <div id="group-{g.id}" class="p-4 pr-2" style:scrollbar-gutter="stable">
              <div class="mb-2 flex justify-between">
                <h6 class="font-semibold">Group - {g.name}</h6>
              </div>
              <Table
                bind:data="{schedulerExam}"
                bind:state="{state}"
                on:select="{(e) => handleSelect(e.detail.weekday, e.detail.period)}"
                on:remove="{(e) => handleDelete(e.detail.id)}"
                small="{true}"
                noDelete="{isPublish}"
                selectable="{true}"
                group="{g}"
              />
            </div>
          {/each}
        </div>
      </div>
      <div class="main-table-container pb-16">
        {#if data.exam.total === 0}
          <div class="p-8 text-center">
            <h1 class="mb-4 text-5xl font-extrabold">No Data</h1>
            <h2 class="text-3xl text-secondary">
              No section created.<br />Must have section data in order for timetable to show.
            </h2>
          </div>
        {/if}

        {#each room.filter((obj) => !state.selected || obj.id === state.exam?.room?.id) as r (r.id)}
          <div
            id="room-{r.id}"
            class="p-4 pr-2"
            style:scrollbar-gutter="stable"
            use:viewport
            on:enterViewport="{() => {
              tableSelectState = r.id;
            }}"
          >
            <div class="mb-2 flex justify-between">
              <h6 class="text-center font-semibold">
                Room - {r.building.code}-{r.name} <span class="capitalize">({r.type})</span>
              </h6>
              <button
                class="rounded bg-primary px-2 font-semibold text-white"
                on:click="{() => (showRoomState = true)}">View All</button
              >
            </div>
            <Table
              bind:data="{schedulerExam}"
              bind:state="{state}"
              on:select="{(e) => handleSelect(e.detail.weekday, e.detail.period)}"
              on:remove="{(e) => handleDelete(e.detail.id)}"
              selectable="{true}"
              noDelete="{isPublish}"
              room="{r}"
            />
          </div>
        {/each}
        {#if state.exam && !state.exam.room}
          <div class="flex h-full w-full items-center justify-center">
            <button
              class="rounded bg-primary p-2 font-semibold text-white"
              on:click="{() => (showRoomState = true)}">Select Room</button
            >
          </div>
        {/if}
      </div>
      <div class="absolute bottom-0 left-0 right-0 z-40 flex overflow-x-auto border-t bg-white">
        {#each room as r (r.id)}
          <a
            href="#room-{r.id}"
            class="inline-block whitespace-nowrap border-r px-4 py-2 last:border-r-0"
            class:bg-slate-200="{r.id === tableSelectState}">{r.building.code}-{r.name}</a
          >
        {/each}
      </div>
    </div>
  </div>
  <div>
    <div class="section-selector border-l bg-light">
      <div class="relative m-4 grid grid-cols-4 items-center gap-4">
        <input
          type="text"
          class="input col-span-3 bg-white shadow"
          placeholder="Search"
          bind:value="{searchText}"
        />
        <button
          class="input flex !w-full items-center justify-center bg-white text-secondary shadow"
          on:click="{() => (showFilter = !showFilter)}"
        >
          <FilterIcon />
        </button>
        <div class="absolute top-full mt-2 w-full overflow-hidden rounded bg-white shadow">
          <Filter show="{showFilter}" list="{filterList}" bind:selected="{filterSelected}" />
        </div>
      </div>
      {#each filteredExam as exam}
        <div class="w-full space-y-2 border-b p-4">
          <div class="mb-2 space-y-2 text-sm">
            <div class="flex gap-2">
              <span class="flex items-center rounded bg-primary px-2 py-1 font-semibold text-white">
                {exam.section[0]?.subject.code ?? ''}
              </span>
              <span class="flex items-center rounded bg-primary px-2 py-1 font-semibold text-white">
                {exam.section[0]?.subject.name ?? ''}
              </span>
            </div>
            <div class="flex gap-2">
              {#each exam.section as sec}
                <span
                  class="flex items-center rounded bg-primary px-2 py-1 font-semibold text-white"
                >
                  SEC {sec.no}
                </span>
              {/each}
            </div>
          </div>
          <button
            class="grid w-full grid-cols-5 flex-row rounded border text-left font-semibold capitalize outline-none"
            class:bg-white="{state.exam?.id !== exam.id}"
            class:bg-green-600="{state.exam?.id === exam.id}"
            class:text-white="{state.exam?.id === exam.id}"
            class:line-through="{schedulerExam.findIndex((sched) => exam.id == sched.exam.id) !==
              -1 || !data.info?.current}"
            class:text-red-600="{schedulerExam.findIndex((sched) => exam.id == sched.exam.id) !==
              -1 || !data.info?.current}"
            on:click="{() => handleSelectExam(exam)}"
          >
            <div
              class="flex h-full w-full items-center justify-center rounded-l border-r text-center font-semibold"
            >
              <small class="block">{exam.room?.building.code ?? ''}-{exam.room?.name ?? ''}</small>
            </div>
            <div class="col-span-3 flex h-full w-full items-center pl-3 font-semibold">
              <div class="text-left">
                {#if exam.instructor.length === 0}
                  <small>Not assigned</small>
                {:else}
                  {#each exam.instructor as inst}
                    <small class="block">{inst.name}</small>
                  {/each}
                {/if}
              </div>
            </div>
            <div class="flex h-full w-full items-center justify-center rounded-l font-semibold">
              <button
                class="flex items-center justify-center !text-blue-500 underline disabled:!text-secondary"
                disabled="{(data.session?.user.id != exam.createdBy.id &&
                  data.session?.user.role != 'admin') ||
                  schedulerExam.findIndex((sched) => exam.id == sched.exam.id) !== -1}"
                on:click|stopPropagation="{() =>
                  triggerEdit({
                    id: exam.id,
                    section: exam.section.map((v) => v.id),
                    instructor: exam.instructor.map((v) => v.id),
                    roomId: exam.room?.id ?? '',
                  })}"
              >
                <small>Edit</small>
              </button>
            </div>
          </button>
        </div>
      {/each}
      <div class="p-4">
        <button
          class="button disabled:cursor-not-allowed disabled:border-secondary disabled:bg-secondary"
          disabled="{!data.info?.current}"
          on:click="{() => (newState = !newState)}">Add Exam</button
        >
      </div>
    </div>
  </div>
</div>
<div class="flex h-16 items-center justify-between overflow-hidden border p-4">
  <div class="pov-switch whitespace-nowrap pr-4">
    <button
      class="rounded border bg-slate-900 px-4 py-2 font-semibold text-white outline-none transition duration-150 focus:bg-slate-800"
      on:click="{() => {
        showState = true;
        resetState();
      }}"
    >
      Generate
    </button>
    <button
      class="rounded border bg-slate-900 px-4 py-2 font-semibold text-white outline-none transition duration-150 focus:bg-slate-800"
      on:click="{() => (showExportState = true)}"
    >
      Export
    </button>
    <button
      class="rounded border px-4 py-2 font-semibold text-white outline-none transition duration-150"
      class:bg-blue-600="{!isPublish}"
      class:focus:bg-blue-700="{!isPublish}"
      class:bg-green-600="{isPublish}"
      class:focus:bg-green-700="{isPublish}"
      on:click="{async () => {
        const flag = confirm('Are you sure?.');

        if (flag) {
          await apiRequest('/api/publish-exam').post({ publish: !isPublish });
          await invalidate('data:scheduler-exam');
        }
      }}"
    >
      {!isPublish ? 'Publish' : 'Unpublish'}
    </button>
    <button
      class="rounded border bg-red-600 px-4 py-2 font-semibold text-white outline-none transition duration-150 focus:bg-red-700"
      on:click="{async () => {
        const flag = confirm('Are you sure? This action cannot be undone.');

        if (flag) {
          await resetData('schedulerExam');
          await invalidate('data:scheduler-exam');
        }
      }}"
    >
      Reset
    </button>
  </div>
  {#if state.exam}
    <div
      class="flex justify-between gap-2 overflow-hidden rounded border border-primary bg-light pr-2 font-semibold shadow"
    >
      <span class="bg-primary px-3 py-2 font-semibold text-white">Selected</span>
      <span class="truncate py-2">
        {state.exam?.section[0]?.subject.code ?? ''}
        {state.exam?.section[0]?.subject.name ?? ''}
      </span>
      <span class="whitespace-nowrap py-2"
        >SEC {state.exam.section.map((sec) => sec.no).join(', ')}</span
      >

      <button class="text-blue-600" on:click="{() => submitData()}"> OK </button>
      <button class="text-red-600" on:click="{() => resetState()}"> Cancel </button>
    </div>
  {/if}
</div>

<Modal bind:open="{showState}">
  <div id="show-modal" class="my-8 space-y-4 p-4">
    <h1 class="text-center text-2xl font-bold">Auto Generate</h1>

    <section id="input-group" class="grid grid-cols-6">
      <div class="col-span-2 flex items-center">
        <label for="" class="font-semibold">Max Exam per day </label>
      </div>
      <div class="col-span-4">
        <input type="number" class="input" bind:value="{maxPerDay}" />
      </div>
    </section>

    <button
      class="w-full rounded border bg-slate-900 px-8 py-2 font-semibold text-white outline-none transition duration-150 focus:bg-slate-800"
      on:click="{() => {
        generate(data.exam.data, schedulerExam, { maxPerDay: maxPerDay });
        ws?.send(JSON.stringify({ update: 2 }));
      }}"
    >
      Generate
    </button>
  </div>
</Modal>

<Modal bind:open="{newState}">
  {#if newState}
    <div id="new" class="p-4">
      <h1 class="mb-4 block text-center text-2xl font-bold">New Exam</h1>
      <div class="mx-auto max-w-screen-md">
        <Form
          callback="{async () => {
            await invalidateAll();
            newState = false;
          }}"
        />
      </div>
    </div>
  {/if}
</Modal>

<Modal bind:open="{showRoomState}" width="50%" maxWidth="50%">
  {#await data.lazy.room}
    Loading...
  {:then roomData}
    <ShowRoom
      scheduler="{schedulerExam}"
      room="{roomData.data}"
      state="{state}"
      handleSelect="{handleSelect}"
      callback="{() => {
        if (!state.exam) return;

        const selected = filteredExam.find((v) => v.id === state.exam?.id);
        if (selected && !handleSelectExam(selected)) {
          resetState();
        }

        showRoomState = false;
      }}"
    />
  {/await}
</Modal>

<Modal bind:open="{showInstructorState}" width="50%" maxWidth="50%">
  {#await data.lazy.instructor}
    Loading...
  {:then instructorData}
    <ShowInstructor
      scheduler="{schedulerExam}"
      instructor="{instructorData.data}"
      state="{state}"
      handleSelect="{handleSelect}"
      callback="{() => {
        if (!state.exam) return;

        const selected = filteredExam.find((v) => v.id === state.exam?.id);
        if (selected && !handleSelectExam(selected)) {
          resetState();
        }
      }}"
    />
  {/await}
</Modal>

<Modal bind:open="{editState}">
  <div id="edit" class="p-4">
    <h1 class="mb-4 block text-center text-2xl font-bold">Edit Exam</h1>

    <Form
      {...currentData}
      edit="{true}"
      callback="{async () => {
        await invalidateAll();
        editState = false;

        if (!state.exam) return;

        const selected = filteredExam.find((v) => v.id === state.exam?.id);
        if (selected && !handleSelectExam(selected)) {
          resetState();
        }
      }}"
    />
  </div>
</Modal>

<Modal bind:open="{showExportState}" center>
  <div id="show-modal" class="my-8 space-y-4 p-4">
    <h1 class="text-center text-2xl font-bold">Export</h1>
    <section id="input-group" class="grid grid-cols-8">
      <div class="col-span-4 flex items-center">
        <label for="" class="font-semibold">Midterm Exam Start Date </label>
      </div>
      <div class="col-span-4">
        <input
          class="rounded border p-2"
          type="date"
          bind:value="{midDateExam}"
          on:change="{() => console.log(new Date(midDateExam).getDate())}"
        />
      </div>
    </section>

    <section id="input-group" class="grid grid-cols-8">
      <div class="col-span-4 flex items-center">
        <label for="" class="font-semibold">Final Exam Start Date </label>
      </div>
      <div class="col-span-4">
        <input class="rounded border p-2" type="date" bind:value="{finalDateExam}" />
      </div>
    </section>
    <section class="grid grid-cols-2 gap-4">
      <button
        class="rounded border bg-slate-900 px-8 py-2 font-semibold text-white outline-none transition duration-150 focus:bg-slate-800"
        on:click="{() => {
          const midDay = new Date(midDateExam).getDay();
          const finalDay = new Date(finalDateExam).getDay();

          if (midDay !== 1 || finalDay !== 1) {
            toast.error('Date select must be on monday.');
            return;
          }

          exportScheduleExam(midDateExam, finalDateExam);
        }}"
      >
        Export Excel
      </button>
    </section>
  </div>
</Modal>

<style>
  .table-small-container {
    height: calc(194px + 1rem + 1.5rem + 1rem + 1rem);
    overflow-y: auto;
    scrollbar-gutter: stable;
  }

  .main-table-container {
    height: calc(100vh - 4rem - 4rem - (194px + 1rem + 1.5rem + 1rem + 1rem));
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
