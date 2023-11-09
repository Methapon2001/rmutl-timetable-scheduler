<script lang="ts">
  import type { PageData } from './$types';
  import { onMount, type ComponentProps, onDestroy, tick } from 'svelte';
  import toast from 'svelte-french-toast';

  import { invalidate, invalidateAll } from '$app/navigation';
  import { createPDF, drawDetailTable, drawSchedule } from '$lib/utils/pdf';
  import { resetData } from '$lib/api/reset';
  import { checkOverlap, processOverlaps } from './utils';

  import { exportSchedule } from '$lib/api/export-data';

  import type { Section, Subject } from '$lib/types';
  import viewport from '$lib/element';
  import apiRequest, { getWebsocketURL } from '$lib/api';

  import Modal from '$lib/components/Modal.svelte';
  import FilterIcon from '$lib/icons/FilterIcon.svelte';
  import Filter from './Filter.svelte';
  import GenerateModal from './GenerateModal.svelte';
  import Table from './Table.svelte';
  import NewForm from '../section/SectionNewForm.svelte';
  import EditForm from '../section/SectionEditForm.svelte';
  import ShowInstructor from './ShowInstructor.svelte';
  import ShowRoom from './ShowRoom.svelte';

  export let data: PageData;

  let ws: WebSocket | undefined = undefined;

  function initWebSocket() {
    ws = new WebSocket(getWebsocketURL());
    ws.onopen = () => console.log('WebSocket Connected.');
    ws.onmessage = (event) => {
      if (JSON.parse(event.data).update === 1) {
        console.log('[WS]: Data change detected, syncing data');
        invalidate('data:scheduler');
      }
    };
    ws.onclose = () => console.log('WebSocket Closed');
  }

  onMount(initWebSocket);
  onDestroy(() => ws?.close());

  let scheduler: ComponentProps<Table>['data'] = [];

  $: scheduler = data.scheduler.data;
  $: instructor = Object.values(
    data.section.data.reduce<
      Record<string, (typeof data.section.data)[number]['instructor'][number]>
    >((acc, curr) => {
      curr.instructor.forEach((inst) => {
        if (!acc[`${inst.id}`]) acc[`${inst.id}`] = inst;
      });
      return acc;
    }, {}),
  );

  $: room = Object.values(
    data.section.data.reduce<
      Record<string, NonNullable<(typeof data.section.data)[number]['room']>>
    >((acc, curr) => {
      if (curr.room && !acc[`${curr.room.id}`]) {
        acc[`${curr.room.id}`] = curr.room;
      }
      return acc;
    }, {}),
  );

  $: group = Object.values(
    data.section.data.reduce<
      Record<string, NonNullable<(typeof data.section.data)[number]['group']>>
    >((acc, curr) => {
      if (curr.group && !acc[`${curr.group.id}`]) {
        acc[`${curr.group.id}`] = curr.group;
      }
      return acc;
    }, {}),
  );

  $: isPublish = data.scheduler.data.some(
    (v) => v.createdBy.id === data.session?.user.id && v.publish === true,
  );

  let pov: 'instructor' | 'group' = 'group';
  let leftOverHours = 0;

  let state: ComponentProps<Table>['state'] = {
    selected: false,
    section: null,
    weekday: 'mon',
    period: 1,
    size: 1,
  };

  function resetState() {
    let currentRoom = state.section?.room;
    let currentInst = state.section?.instructor;

    state = {
      period: 1,
      size: 1,
      weekday: 'mon',
      section: null,
      selected: false,
    };

    tick().then(() => {
      if (currentRoom)
        document.getElementById(`room-${currentRoom.id}`)?.scrollIntoView({ block: 'nearest' });
      if (currentInst && currentInst.length > 0)
        document.getElementById(`inst-${currentInst[0].id}`)?.scrollIntoView({ block: 'nearest' });
    });
  }

  function handleSelect(weekday: ComponentProps<Table>['state']['weekday'], period: number) {
    if (!state.section) return;

    state.selected = Boolean(state.section);
    state.weekday = weekday;
    state.period = period;

    detectOverlap();
  }

  function detectOverlap() {
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

  async function submitData() {
    let confirmOverlap = false;

    if (!state.section) return;
    if (state.isOverflow) return alert('Overflowed!!! Not Allowed.');
    if (state.isOverlap && !state.allowOverlap) return alert('Overlap Detected!!! Not Allowed.');
    if (state.isOverlap) confirmOverlap = confirm('Overlap Detected!!! Do you want to continue?');
    if (state.isOverlap && !confirmOverlap) return;

    if (ws?.readyState !== WebSocket.OPEN) {
      initWebSocket();
    }

    await apiRequest('/api/scheduler').post({
      weekday: state.weekday,
      start: state.period,
      end: state.period + state.size - 1,
      sectionId: state.section.id,
      publish: false,
    });

    resetState();
  }

  async function handleKeydown(e: KeyboardEvent) {
    switch (e.key) {
      case 'Enter':
        submitData();
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

  type SectionArg = NonNullable<(typeof state)['section']>;

  function getRequiredHour(section: SectionArg) {
    return section.type === 'lecture' ? section.subject.lecture : section.subject.lab;
  }

  function getUsedHour(section: SectionArg) {
    return scheduler
      .filter((sched) => sched.section.id === section.id)
      .reduce((acc, curr) => acc + (curr.end - curr.start + 1) / 2, 0);
  }

  function getLeftOverHours(section: SectionArg) {
    return getRequiredHour(section) - getUsedHour(section);
  }

  function handleSelectSection(section: SectionArg) {
    if (isPublish) {
      toast.error('Data is published, Cannot edit.');
      return false;
    }

    if (!section.instructor && !section.group) {
      toast.error('Section must assign at least one instructor or one group.', {
        duration: 7500,
      });
      return false;
    }

    if (pov === 'group' && !section.group) {
      toast.error('Selected group pov but section is not assigned to any group.', {
        duration: 7500,
      });
      return false;
    }

    if (pov === 'instructor' && section.instructor.length === 0) {
      toast.error('Selected instructor pov but no instructor is assigned to section.', {
        duration: 7500,
      });
      return false;
    }

    let left = getLeftOverHours(section);

    if (left > 0) {
      state.selected = true;
      state.section = section;
      state.size = left * 2;

      leftOverHours = left;

      detectOverlap();

      if (pov === 'group') {
        document.querySelector(`#group-${state.section?.group?.id}`)?.scrollIntoView({
          behavior: 'smooth',
        });
      } else {
        document.querySelector(`#inst-${state.section?.instructor[0].id}`)?.scrollIntoView({
          behavior: 'smooth',
        });
      }
    }

    return true;
  }

  function exportPDF() {
    const doc = createPDF();

    const { width: pageWidth, height: pageHeight } = doc.internal.pageSize;

    const pageGap = 3;

    let docSchedule: ReturnType<typeof drawSchedule>;
    let docScheduleDetail: ReturnType<typeof drawDetailTable>;

    const drawLayout = () => {
      docSchedule = drawSchedule(
        doc,
        pageGap,
        105,
        pageWidth - pageGap * 2,
        pageHeight - 105 - pageGap,
        {
          period: 25,
          fontSize: 12,
          borderWidth: 0.3,
          colHeaderWidth: 15,
          rowHeaderHeight: 12,
        },
      );

      docScheduleDetail = drawDetailTable(
        doc,
        pageGap,
        pageGap,
        pageWidth - pageGap * 2,
        105 - pageGap,
        {
          period: 25,
          fontSize: 12,
          borderWidth: 0.3,
          rowHeaderHeight: 14,
        },
        docSchedule,
      );
    };

    group.forEach((grp) => {
      const filtered = scheduler.filter((sched) => sched.section.group?.id === grp.id);

      if (filtered.length === 0) return;

      const processed = processOverlaps(filtered);

      drawLayout();

      docSchedule.assignSchedule(processed);
      docScheduleDetail.setHeader(grp.name);
      docScheduleDetail.addDetail(processed, { onlyParent: true });

      doc.addPage();
    });

    instructor.forEach((inst) => {
      const filtered = scheduler.filter(
        (sched) => sched.section.instructor.findIndex((v) => v.id === inst.id) !== -1,
      );

      if (filtered.length === 0) return;

      const processed = processOverlaps(filtered);

      drawLayout();

      docSchedule.assignSchedule(processed);
      docScheduleDetail.setHeader(inst.name);
      docScheduleDetail.addDetail(processed, { showGroup: true });

      doc.addPage();
    });

    room.forEach((r) => {
      const filtered = scheduler.filter((v) => v.section.room?.id === r.id);

      if (filtered.length === 0) return;

      const processed = processOverlaps(filtered);

      drawLayout();

      docSchedule.assignSchedule(processed);
      docScheduleDetail.setHeader(`${r.building.code}-${r.name}`);
      docScheduleDetail.addDetail(processed);

      doc.addPage();
    });
    doc.deletePage(doc.getNumberOfPages());
    doc.output('dataurlnewwindow');
  }

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
  let searchText = '';

  $: filteredSection = data.section.data.filter((v) => {
    const filterFn = (text: string, exact = false) => {
      const lowerCase = text.toLocaleLowerCase();
      const subjectCodeLowerCase = v.subject.code.toLocaleLowerCase();
      const subjectNameLowerCase = v.subject.name.toLocaleLowerCase();
      const groupLowerCase = v.group?.name.toLocaleLowerCase();

      if (exact) {
        return (
          lowerCase === subjectCodeLowerCase ||
          lowerCase === subjectNameLowerCase ||
          lowerCase === groupLowerCase ||
          v.instructor.some((a) => a.name.toLocaleLowerCase() === text)
        );
      }

      return (
        subjectNameLowerCase.includes(lowerCase) ||
        subjectCodeLowerCase.includes(lowerCase) ||
        (groupLowerCase && groupLowerCase.includes(lowerCase)) ||
        v.instructor.some((a) => a.name.toLocaleLowerCase().includes(lowerCase))
      );
    };

    if (filterSelected.length > 0 && !filterSelected.some((txt) => filterFn(txt, true))) {
      return false;
    }

    return filterFn(searchText);
  });

  let newState = false;
  let editState = false;

  let currentData: Section & {
    /** Overwrite alt type since it is optional when fetched from api */
    alt: string;
    roomId: string;
    groupId: string;
    instructorId: string[];
    subject: Subject;
  };

  function triggerEdit(section: typeof currentData) {
    editState = true;
    currentData = section;
  }

  let showRoomState = false;
  let showInstructorState = false;
  let tableSelectState: string;

  async function handleDelete(id: string) {
    const currentSched = scheduler.find((v) => v.id === id);

    const ret = await apiRequest('/api/scheduler')
      .delete({ id })
      .catch((e) => console.error(e));

    if (!ret) return toast.error('Failed to delete. \nSee console for more info.');

    await invalidate('data:scheduler');

    if (currentSched) {
      handleSelectSection(currentSched.section);
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
        <div class="table-small-container relative border-b border-r">
          {#if pov === 'group'}
            {#each instructor.filter((obj) => state.section?.instructor.findIndex((inst) => inst.id == obj.id) !== -1) as i (i.id)}
              <div id="inst-{i.id}" class="p-4 pr-2" style:scrollbar-gutter="stable">
                <div class="mb-2 flex justify-between">
                  <h6 class="font-semibold">Instructor - {i.name}</h6>
                  <button
                    class="rounded bg-primary px-2 font-semibold text-white"
                    on:click="{() => (showInstructorState = true)}"
                    >{state.selected ? 'Change' : 'View All'}</button
                  >
                </div>
                <Table
                  bind:data="{scheduler}"
                  bind:state="{state}"
                  on:select="{(e) => handleSelect(e.detail.weekday, e.detail.period)}"
                  on:remove="{(e) => handleDelete(e.detail.id)}"
                  small="{true}"
                  selectable="{data.info?.current}"
                  instructor="{i}"
                />
              </div>
            {/each}
          {:else}
            {#each group.filter((obj) => !state.selected || state.section?.group?.id === obj.id) as g (g.id)}
              <div id="group-{g.id}" class="p-4 pr-2" style:scrollbar-gutter="stable">
                <div class="mb-2 flex justify-between">
                  <h6 class="font-semibold">Group - {g.name}</h6>
                </div>
                <Table
                  bind:data="{scheduler}"
                  bind:state="{state}"
                  on:select="{(e) => handleSelect(e.detail.weekday, e.detail.period)}"
                  on:remove="{(e) => handleDelete(e.detail.id)}"
                  small="{true}"
                  selectable="{data.info?.current}"
                  group="{g}"
                />
              </div>
            {/each}
          {/if}
        </div>
        <div class="table-small-container border-b">
          {#each room.filter((obj) => !state.selected || obj.id === state.section?.room?.id) as r (r.id)}
            <div id="room-{r.id}" class="p-4 pr-2" style:scrollbar-gutter="stable">
              <div class="mb-2 flex justify-between">
                <h6 class="text-center font-semibold">
                  Room - {r.building.code}-{r.name} <span class="capitalize">({r.type})</span>
                </h6>
                <button
                  class="rounded bg-primary px-2 font-semibold text-white"
                  on:click="{() => (showRoomState = true)}"
                  >{state.selected ? 'Change' : 'View All'}</button
                >
              </div>
              <Table
                bind:data="{scheduler}"
                bind:state="{state}"
                on:select="{(e) => handleSelect(e.detail.weekday, e.detail.period)}"
                on:remove="{(e) => handleDelete(e.detail.id)}"
                small="{true}"
                selectable="{data.info?.current}"
                room="{r}"
              />
            </div>
          {/each}
          {#if state.section && !state.section.room}
            <div class="flex h-full w-full items-center justify-center">
              <button
                class="rounded bg-primary p-2 font-semibold text-white"
                on:click="{() => (showRoomState = true)}">Select Room</button
              >
            </div>
          {/if}
        </div>
      </div>
      <div class="main-table-container pb-16">
        {#if data.section.total === 0}
          <div class="p-8 text-center">
            <h1 class="mb-4 text-5xl font-extrabold">No Data</h1>
            <h2 class="text-3xl text-secondary">
              No section created.<br />Must have section data in order for timetable to show.
            </h2>
          </div>
        {/if}

        {#if pov === 'group'}
          {#each group as g (g.id)}
            <div
              id="group-{g.id}"
              class="p-4 pr-2"
              style:scrollbar-gutter="stable"
              use:viewport
              on:enterViewport="{() => {
                tableSelectState = g.id;
              }}"
            >
              <div class="mb-2 flex justify-between">
                <h6 class="font-semibold">Group - {g.name}</h6>
              </div>
              <Table
                bind:data="{scheduler}"
                bind:state="{state}"
                on:select="{(e) => handleSelect(e.detail.weekday, e.detail.period)}"
                on:remove="{(e) => handleDelete(e.detail.id)}"
                selectable="{data.info?.current}"
                noDelete="{isPublish}"
                group="{g}"
              />
            </div>
          {/each}
        {:else}
          {#each instructor as i (i.id)}
            <div
              id="inst-{i.id}"
              class="p-4 pr-2"
              style:scrollbar-gutter="stable"
              use:viewport
              on:enterViewport="{() => {
                tableSelectState = i.id;
              }}"
            >
              <div class="mb-2 flex justify-between">
                <h6 class="font-semibold">Instructor - {i.name}</h6>
                <button
                  class="rounded bg-primary px-2 font-semibold text-white"
                  on:click="{() => (showInstructorState = true)}"
                  >{state.selected ? 'Change' : 'View All'}</button
                >
              </div>
              <Table
                bind:data="{scheduler}"
                bind:state="{state}"
                on:select="{(e) => handleSelect(e.detail.weekday, e.detail.period)}"
                on:remove="{(e) => handleDelete(e.detail.id)}"
                selectable="{data.info?.current}"
                noDelete="{isPublish}"
                instructor="{i}"
              />
            </div>
          {/each}
        {/if}
      </div>
      <div class="absolute bottom-0 left-0 right-0 z-40 flex overflow-x-auto border-t bg-white">
        {#if pov === 'instructor'}
          {#each instructor as i (i.id)}
            <a
              on:click="{() => (filterSelected = [i.name])}"
              href="#inst-{i.id}"
              class="inline-block whitespace-nowrap border-r px-4 py-2 last:border-r-0"
              class:bg-slate-200="{i.id === tableSelectState}">{i.name}</a
            >
          {/each}
        {:else}
          {#each group as g (g.id)}
            <a
              on:click="{() => (filterSelected = [g.name])}"
              href="#group-{g.id}"
              class="inline-block whitespace-nowrap border-r px-4 py-2 last:border-r-0"
              class:bg-slate-200="{g.id === tableSelectState}">{g.name}</a
            >
          {/each}
        {/if}
      </div>
    </div>
  </div>
  <div>
    <div class="section-selector border-l bg-light">
      <div class="relative m-4 mb-0 grid grid-cols-4 items-center gap-4">
        <input
          type="text"
          class="input col-span-3 bg-white shadow"
          placeholder="Search"
          bind:value="{searchText}"
        />
        <button
          class="input flex !w-full items-center justify-center shadow"
          class:bg-white="{filterSelected.length === 0}"
          class:text-secondary="{filterSelected.length === 0}"
          class:bg-blue-400="{filterSelected.length > 0}"
          class:text-white="{filterSelected.length > 0}"
          on:click="{() => (showFilter = !showFilter)}"
        >
          <FilterIcon />
        </button>
        <div class="absolute top-full mt-2 w-full overflow-hidden rounded bg-white shadow">
          <Filter show="{showFilter}" list="{filterList}" bind:selected="{filterSelected}" />
        </div>
      </div>
      {#each filteredSection as section}
        {#if section.parent === null}
          <div class="w-full space-y-2 border-b p-4">
            <div class="mb-2 space-y-2 text-sm">
              <div class="flex gap-2">
                <span
                  class="flex items-center rounded bg-primary px-2 py-1 font-semibold text-white"
                >
                  {section.subject.code}
                </span>
                <span
                  class="flex items-center rounded bg-primary px-2 py-1 font-semibold text-white"
                >
                  {section.subject.name}
                </span>
              </div>

              <div class="flex gap-2">
                <span
                  class="flex items-center rounded bg-primary px-2 py-1 font-semibold text-white"
                >
                  SEC {section.no}
                </span>
                <span
                  class="flex items-center rounded bg-primary px-2 py-1 font-semibold text-white"
                >
                  {section.group?.name ?? 'Any'}
                </span>
              </div>
            </div>
            <button
              class="grid w-full grid-cols-5 flex-row rounded border capitalize outline-none"
              class:bg-white="{state.section?.id !== section.id}"
              class:bg-green-400="{state.section?.id === section.id}"
              class:line-through="{getLeftOverHours(section) == 0}"
              class:text-red-600="{getLeftOverHours(section) == 0}"
              class:cursor-default="{getLeftOverHours(section) == 0}"
              class:text-yellow-500="{getUsedHour(section) > 0 &&
                getUsedHour(section) < getRequiredHour(section) &&
                state.section?.id != section.id}"
              disabled="{!data.info?.current}"
              on:click="{() => handleSelectSection(section)}"
            >
              <div
                class="flex h-full w-full items-center justify-center rounded-l border-r text-center font-semibold"
              >
                <small class="block">
                  {section.type}
                  {section.lab ?? ''}
                </small>
              </div>
              <div class="col-span-3 flex h-full w-full items-center pl-3 font-semibold">
                <div class="text-left">
                  {#if section.instructor.length == 0}
                    <small class="block w-full">Not assigned</small>
                  {:else}
                    {#each section.instructor as instructor}
                      <small class="block w-full">{instructor.name}</small>
                    {/each}
                  {/if}
                </div>
              </div>
              <div class="flex h-full w-full items-center justify-center rounded-l font-semibold">
                <button
                  class="item-scenter flex justify-center !text-blue-500 underline disabled:!text-secondary"
                  disabled="{(data.session?.user.id != section.createdBy.id &&
                    data.session?.user.role != 'admin') ||
                    (getUsedHour(section) > 0 &&
                      getUsedHour(section) < getRequiredHour(section) &&
                      state.section?.id != section.id) ||
                    getLeftOverHours(section) == 0 ||
                    !data.info?.current}"
                  on:click|stopPropagation="{() => {
                    triggerEdit({
                      id: section.id,
                      no: section.no, // no-edit, readonly
                      lab: section.lab, // no-edit, readonly
                      type: section.type, // no-edit, readonly
                      alt: section.alt ?? '',
                      capacity: section.capacity,
                      groupId: section.group?.id ?? '',
                      roomId: section.room?.id ?? '',
                      instructorId: section.instructor.map((v) => v.id),
                      subject: section.subject, // no-edit, readonly
                    });
                    invalidate('data:scheduler');
                  }}"
                >
                  <small>Edit</small>
                </button>
              </div>
            </button>

            {#each filteredSection.filter((x) => x.parent?.id === section.id) as child}
              <button
                class="grid w-full grid-cols-5 flex-row rounded border capitalize outline-none"
                class:bg-white="{state.section?.id !== child.id}"
                class:bg-green-400="{state.section?.id === child.id}"
                class:text-red-600="{getLeftOverHours(child) == 0}"
                class:line-through="{getLeftOverHours(child) == 0}"
                class:cursor-default="{getLeftOverHours(child) == 0}"
                class:text-yellow-500="{getUsedHour(child) > 0 &&
                  getUsedHour(child) < getRequiredHour(child) &&
                  state.section?.id != child.id}"
                disabled="{!data.info?.current}"
                on:click="{() => handleSelectSection(child)}"
              >
                <div
                  class="flex h-full w-full items-center justify-center rounded-l border-r text-center font-semibold"
                >
                  <small class="block">
                    {child.type}
                    {child.lab ?? ''}
                  </small>
                </div>
                <div class="col-span-3 flex h-full w-full items-center pl-3 font-semibold">
                  <div class="text-left">
                    {#if child.instructor.length == 0}
                      <small>Not assigned</small>
                    {:else}
                      {#each child.instructor as instructor}
                        <small class="block w-full">{instructor.name}</small>
                      {/each}
                    {/if}
                  </div>
                </div>
                <div
                  class="flex h-full w-full items-center justify-center rounded-l border-r font-semibold"
                >
                  <button
                    class="flex items-center justify-center !text-blue-500 underline disabled:!text-secondary"
                    disabled="{(data.session?.user.id != section.createdBy.id &&
                      data.session?.user.role != 'admin') ||
                      (getUsedHour(child) > 0 &&
                        getUsedHour(child) < getRequiredHour(child) &&
                        state.section?.id != child.id) ||
                      getLeftOverHours(child) == 0 ||
                      !data.info?.current}"
                    on:click|stopPropagation="{() => {
                      triggerEdit({
                        id: child.id,
                        no: child.no, // no-edit, readonly
                        lab: child.lab, // no-edit, readonly
                        type: child.type, // no-edit, readonly
                        alt: child.alt ?? '',
                        capacity: child.capacity,
                        groupId: child.group?.id ?? '',
                        roomId: child.room?.id ?? '',
                        instructorId: child.instructor.map((v) => v.id),
                        subject: child.subject, // no-edit, readonly
                      });
                      invalidate('data:scheduler');
                    }}"
                  >
                    <small>Edit</small>
                  </button>
                </div>
              </button>
            {/each}
          </div>
        {/if}
      {/each}
      <div class="p-4">
        <button
          class="button disabled:cursor-not-allowed disabled:border-secondary disabled:bg-secondary"
          disabled="{!data.info?.current}"
          on:click="{() => (newState = !newState)}">Add Section</button
        >
      </div>
    </div>
  </div>
</div>
<div class="flex h-16 items-center justify-between overflow-hidden border p-4">
  <div class="pov-switch whitespace-nowrap pr-4">
    <button
      on:click="{() => {
        pov = pov === 'group' ? 'instructor' : 'group';
        resetState();
      }}"
      class="rounded border bg-slate-900 px-4 py-2 font-semibold text-white outline-none transition duration-150 focus:bg-slate-800"
    >
      View: <span class="capitalize">{pov}</span>
    </button>
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
      on:click="{() => exportPDF()}"
    >
      Export PDF
    </button>
    <button
      class="rounded border bg-slate-900 px-4 py-2 font-semibold text-white outline-none transition duration-150 focus:bg-slate-800"
      on:click="{() => {
        exportSchedule('group');
        exportSchedule('instructor');
        exportSchedule('room');
      }}"
    >
      Export Excel
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
          await apiRequest('/api/publish').post({ publish: !isPublish });
          await invalidate('data:scheduler');
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
          await resetData('scheduler');
          await invalidate('data:scheduler');
        }
      }}"
    >
      Reset
    </button>
  </div>
  {#if state.section}
    <div
      class="flex justify-between gap-2 overflow-hidden rounded border border-primary bg-light pr-2 font-semibold shadow"
    >
      <span class="bg-primary px-3 py-2 font-semibold text-white">Selected</span>
      <span class="truncate py-2">
        {state.section?.subject.code ?? ''}
        {state.section?.subject.name ?? ''}
      </span>
      <span class="whitespace-nowrap py-2">{state.section?.group?.name ?? ''}</span>
      <span class="whitespace-nowrap py-2">SEC {state.section?.no ?? ''}</span>
      <span class="whitespace-nowrap py-2 capitalize"
        >{state.section?.type} {state.section?.lab ?? ''}</span
      >
      <button class="text-blue-600" on:click="{() => submitData()}"> OK </button>
      <button class="text-red-600" on:click="{() => resetState()}"> Cancel </button>
    </div>
  {/if}

  <div class="alloc-control" title="Section Size">
    <div class="grid grid-cols-12 rounded bg-primary font-semibold text-white">
      <div class="col-span-4 flex items-center justify-center px-2">
        <span class="text-center"> Section Size </span>
      </div>
      <div class="col-span-7 flex items-center py-4">
        <input
          class="w-full"
          type="range"
          min="1"
          max="{leftOverHours * 2}"
          disabled="{state.section === null}"
          on:change="{() => detectOverlap()}"
          bind:value="{state.size}"
        />
      </div>
      <div class="col-span-1 flex items-center justify-center px-2">
        <span class="block text-center">
          {state.size}
        </span>
      </div>
    </div>
  </div>
</div>

<Modal bind:open="{showState}">
  <div id="show-modal" class="my-8 p-4">
    <GenerateModal
      sections="{data.section.data}"
      schedule="{scheduler}"
      group="{group}"
      ws="{ws}"
    />
  </div>
</Modal>

<Modal bind:open="{showRoomState}" width="50%" maxWidth="50%">
  {#await data.lazy.room}
    Loading...
  {:then roomData}
    <ShowRoom
      scheduler="{scheduler}"
      room="{roomData.data}"
      state="{state}"
      handleSelect="{handleSelect}"
      callback="{() => {
        if (!state.section) return;

        const selected = filteredSection.find((v) => v.id === state.section?.id);
        if (selected && !handleSelectSection(selected)) {
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
      scheduler="{scheduler}"
      instructor="{instructorData.data}"
      state="{state}"
      handleSelect="{handleSelect}"
      callback="{() => {
        if (!state.section) return;

        const selected = filteredSection.find((v) => v.id === state.section?.id);
        if (selected && !handleSelectSection(selected)) {
          resetState();
        }

        showRoomState = false;
      }}"
    />
  {/await}
</Modal>

<Modal bind:open="{newState}">
  <div id="edit" class="p-4">
    <h1 class="block text-center text-2xl font-bold">New Section</h1>
    <hr class="my-2" />
    <NewForm
      callback="{async () => {
        await invalidateAll();
        newState = false;
      }}"
    />
  </div>
</Modal>

<Modal bind:open="{editState}">
  <div id="edit" class="p-4">
    <h1 class="block text-center text-2xl font-bold">Edit Section</h1>
    <hr class="my-2" />
    <EditForm
      {...currentData}
      callback="{async () => {
        await invalidateAll();
        editState = false;

        if (!state.section) return;

        const selected = filteredSection.find((v) => v.id === state.section?.id);
        if (selected && !handleSelectSection(selected)) {
          resetState();
        }
      }}"
    />
  </div>
</Modal>

<style>
  .table-small-container {
    height: calc(193px + 1rem + 1.5rem + 1rem + 0.5rem);
    overflow-y: auto;
    scrollbar-gutter: stable;
  }

  .main-table-container {
    height: calc(100vh - 4rem - 4rem - (193px + 1rem + 1.5rem + 1rem + 0.5rem));
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
