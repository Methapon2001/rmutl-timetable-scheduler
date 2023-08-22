<script lang="ts">
  import { onMount, type ComponentProps, onDestroy } from 'svelte';
  import type { PageData } from './$types';
  import { PUBLIC_API_WS } from '$env/static/public';
  import { invalidate } from '$app/navigation';
  import { createPDF, drawDetailTable, drawSchedule } from '$lib/utils/pdf';
  import { resetData } from '$lib/api/reset';
  import { createScheduler } from '$lib/api/scheduler';
  import { processOverlaps } from '$lib/utils/table';
  import { checkOverlap } from './utils';
  import toast from 'svelte-french-toast';
  import Table from './Table.svelte';
  import Modal from '$lib/components/Modal.svelte';
  import ModalCenter from '$lib/components/ModalCenter.svelte';
  import GenerateModal from './GenerateModal.svelte';
  import FilterIcon from '$lib/icons/FilterIcon.svelte';
  import Filter from './Filter.svelte';
  import { publish } from '$lib/api/publish';
  import viewport from '$lib/utils/useViewportAction';
  import SectionNewForm from '../section/NewForm.svelte';
  import SectionEditForm from '../section/EditForm.svelte';
  import ShowRoom from './ShowRoom.svelte';
  import { exportSchedule } from '$lib/api/export-data';

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

  onDestroy(() => ws.close());

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

  $: isPublish = data.scheduler.data.some((sched) => {
    return sched.createdBy.id === data.session?.user.id && sched.publish === true;
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

  $: instructor = Object.values(
    data.section.data.reduce<
      Record<string, Omit<API.Instructor, 'createdAt' | 'createdBy' | 'updatedAt' | 'updatedBy'>> // eslint-disable-line no-undef
    >((acc, curr) => {
      curr.instructor.forEach((inst) => {
        if (!acc[`${inst.id}`]) acc[`${inst.id}`] = inst;
      });
      return acc;
    }, {}),
  );

  $: room = Object.values(
    data.section.data.reduce<
      Record<string, Omit<API.Room, 'createdAt' | 'createdBy' | 'updatedAt' | 'updatedBy'>> // eslint-disable-line no-undef
    >((acc, curr) => {
      if (curr.room && !acc[`${curr.room.id}`]) {
        acc[`${curr.room.id}`] = curr.room;
      }
      return acc;
    }, {}),
  );

  $: group = Object.values(
    data.section.data.reduce<
      Record<string, Omit<API.Group, 'createdAt' | 'createdBy' | 'updatedAt' | 'updatedBy'>> // eslint-disable-line no-undef
    >((acc, curr) => {
      if (curr.group && !acc[`${curr.group.id}`]) {
        acc[`${curr.group.id}`] = curr.group;
      }
      return acc;
    }, {}),
  );

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
  }

  async function submitData() {
    let confirmOverlap = false;

    if (!state.section) return;
    if (state.isOverflow) return alert('Overflowed!!! Not Allowed.');
    if (state.isOverlap && !state.allowOverlap) return alert('Overlap Detected!!! Not Allowed.');
    if (state.isOverlap) confirmOverlap = confirm('Overlap Detected!!! Do you want to continue?');
    if (state.isOverlap && !confirmOverlap) return;

    await createScheduler({
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
    if (isPublish) {
      toast.error('Data is published, Cannot edit.');
      return;
    }

    if (!section.instructor && !section.group) {
      toast.error('Section must assign at least one instructor or one group.', {
        duration: 7500,
      });
      return;
    }

    if (pov === 'group' && !section.group) {
      toast.error('Selected group pov but section is not assigned to any group.', {
        duration: 7500,
      });
      return;
    }

    if (pov === 'instructor' && section.instructor.length === 0) {
      toast.error('Selected instructor pov but no instructor is assigned to section.', {
        duration: 7500,
      });
      return;
    }

    let left = getLeftOverHours(section);

    if (left > 0) {
      state.selected = true;
      state.section = section;
      state.size = left * 2;

      leftOverHours = left;

      handleDataChange();
    }

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
      docScheduleDetail.addDetail(processed);

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
      docScheduleDetail.addDetail(processed);

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

  const filterList = [
    {
      group: 'Group',
      options: group?.map((grp) => ({
        value: grp.name,
        label: grp.name,
      })),
    },
    {
      group: 'Instructor',
      options: instructor?.map((inst) => ({
        value: inst.name,
        label: inst.name,
      })),
    },
  ];

  let showState = false;

  let searchText = '';

  $: filteredSection = data.section.data.filter((obj) => {
    const filterFn = (text: string) =>
      obj.subject.code.toLocaleLowerCase().includes(text.toLocaleLowerCase()) ||
      obj.group?.name.toLocaleLowerCase().includes(text.toLocaleLowerCase()) ||
      obj.subject.name.toLocaleLowerCase().includes(text.toLocaleLowerCase()) ||
      obj.instructor.some((ins) => ins.name.toLocaleLowerCase().includes(text.toLocaleLowerCase()));

    if (filterSelected.length > 0) {
      return filterSelected.some((txt) => filterFn(txt));
    }
    if (searchText && filterSelected.length > 0) {
      return [searchText, ...filterSelected].some((txt) => filterFn(txt));
    }
    return filterFn(searchText);
  });

  let newState = false;
  let editState = false;
  let editData: {
    id: string;
    alt: string;
    groupId: string;
    roomId: string;
    instructor: string[];
    capacity: number;
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
      capacity: number;
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

  let showRoomState = false;

  let tableSelectState: string;
</script>

<svelte:window on:keydown="{handleKeydown}" />

<div class="flex">
  <div class="flex-grow">
    <div class="relative">
      <div class="z-20 grid grid-cols-2">
        <div class="table-small-container border-b border-r">
          {#if pov === 'group'}
            {#each instructor.filter((obj) => state.section?.instructor.findIndex((inst) => inst.id == obj.id) !== -1) as i (i.id)}
              <div id="inst-{i.id}" class="p-4 pr-2" style:scrollbar-gutter="stable">
                <div class="mb-2 flex justify-between">
                  <h6 class="font-semibold">Instructor - {i.name}</h6>
                </div>
                <Table
                  bind:data="{scheduler}"
                  bind:state="{state}"
                  on:select="{(e) => handleSelect(e.detail.weekday, e.detail.period)}"
                  small="{true}"
                  selectable="{data.lazy.info?.current}"
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
                  small="{true}"
                  selectable="{data.lazy.info?.current}"
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
                  class="bg-primary rounded px-2 font-semibold text-white"
                  on:click="{() => (showRoomState = true)}">View All</button
                >
              </div>
              <Table
                bind:data="{scheduler}"
                bind:state="{state}"
                on:select="{(e) => handleSelect(e.detail.weekday, e.detail.period)}"
                small="{true}"
                selectable="{data.lazy.info?.current}"
                room="{r}"
              />
            </div>
          {/each}
          {#if !state.section?.room}
            <div class="flex h-full w-full items-center justify-center">
              <button
                class="bg-primary rounded p-2 font-semibold text-white"
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
            <h2 class="text-secondary text-3xl">
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
                selectable="{data.lazy.info?.current}"
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
              </div>
              <Table
                bind:data="{scheduler}"
                bind:state="{state}"
                on:select="{(e) => handleSelect(e.detail.weekday, e.detail.period)}"
                selectable="{data.lazy.info?.current}"
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
              href="#inst-{i.id}"
              class="inline-block whitespace-nowrap border-r px-4 py-2 last:border-r-0"
              class:bg-slate-200="{i.id === tableSelectState}">{i.name}</a
            >
          {/each}
        {:else}
          {#each group as g (g.id)}
            <a
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
    <div class="section-selector bg-light border-l">
      <div class="relative m-4 mb-0 grid grid-cols-4 items-center gap-4">
        <input
          type="text"
          class="input col-span-3 bg-white shadow"
          placeholder="Search"
          bind:value="{searchText}"
        />
        <button
          class="input text-secondary flex !w-full items-center justify-center bg-white shadow"
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
                  class="bg-primary flex items-center rounded px-2 py-1 font-semibold text-white"
                >
                  {section.subject.code}
                </span>
                <span
                  class="bg-primary flex items-center rounded px-2 py-1 font-semibold text-white"
                >
                  {section.subject.name}
                </span>
              </div>

              <div class="flex gap-2">
                <span
                  class="bg-primary flex items-center rounded px-2 py-1 font-semibold text-white"
                >
                  SEC {section.no}
                </span>
                <span
                  class="bg-primary flex items-center rounded px-2 py-1 font-semibold text-white"
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
              class:text-yellow-500="{getUsedHour(section) > 0 &&
                getUsedHour(section) < getRequiredHour(section) &&
                state.section?.id != section.id}"
              disabled="{!data.lazy.info?.current}"
              on:click="{() => handleSelectSection(section)}"
            >
              <div
                class="flex h-full w-full items-center justify-center rounded-l border-r font-semibold"
              >
                <small class="block">
                  {section.type}
                  {section.lab ?? ''}
                </small>
              </div>
              <div class="col-span-3 w-full pl-3 text-left font-semibold">
                {#if section.instructor.length == 0}
                  <small>Not assigned</small>
                {:else}
                  {#each section.instructor as instructor}
                    <small>{instructor.name}</small><br />
                  {/each}
                {/if}
              </div>

              <div
                class="flex h-full w-full items-center justify-center rounded-l border-r font-semibold"
              >
                <button
                  class="disabled:!text-secondary !text-blue-500 underline"
                  disabled="{(data.session?.user.id != section.createdBy.id &&
                    data.session?.user.role != 'admin') ||
                    (getUsedHour(section) > 0 &&
                      getUsedHour(section) < getRequiredHour(section) &&
                      state.section?.id != section.id) ||
                    getLeftOverHours(section) == 0 ||
                    !data.lazy.info?.current}"
                  on:click|stopPropagation="{() => {
                    showEdit(
                      {
                        id: section.id,
                        alt: section.alt ?? '',
                        groupId: section.group?.id ?? '',
                        roomId: section.room?.id ?? '',
                        instructor: section.instructor,
                        capacity: section.capacity,
                      },
                      {
                        no: section.no,
                        type: section.type,
                        lab: section.lab,
                        subject: section.subject,
                      },
                    );
                    invalidate('data:scheduler');
                  }}"><small>Edit</small></button
                >
              </div>
            </button>

            {#each section.child as child}
              <button
                class="grid w-full grid-cols-5 flex-row rounded border capitalize outline-none"
                class:bg-white="{state.section?.id !== child.id}"
                class:bg-green-400="{state.section?.id === child.id}"
                class:text-red-600="{getLeftOverHours(child) == 0}"
                class:line-through="{getLeftOverHours(child) == 0}"
                class:text-yellow-500="{getUsedHour(child) > 0 &&
                  getUsedHour(child) < getRequiredHour(child) &&
                  state.section?.id != child.id}"
                disabled="{!data.lazy.info?.current}"
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
                  {#if section.instructor.length == 0}
                    <small>Not assigned</small>
                  {:else}
                    {#each child.instructor as instructor}
                      <small>{instructor.name}</small><br />
                    {/each}
                  {/if}
                </div>
                <div
                  class="flex h-full w-full items-center justify-center rounded-l border-r font-semibold"
                >
                  <button
                    class="disabled:!text-secondary !text-blue-500 underline"
                    disabled="{(data.session?.user.id != section.createdBy.id &&
                      data.session?.user.role != 'admin') ||
                      (getUsedHour(child) > 0 &&
                        getUsedHour(child) < getRequiredHour(child) &&
                        state.section?.id != child.id) ||
                      getLeftOverHours(child) == 0 ||
                      !data.lazy.info?.current}"
                    on:click|stopPropagation="{() => {
                      showEdit(
                        {
                          id: child.id,
                          alt: child.alt ?? '',
                          groupId: child.group?.id ?? '',
                          roomId: child.room?.id ?? '',
                          instructor: child.instructor,
                          capacity: child.capacity,
                        },
                        {
                          no: child.no,
                          type: child.type,
                          lab: child.lab,
                          subject: child.subject,
                        },
                      );
                      invalidate('data:scheduler');
                    }}"><small>Edit</small></button
                  >
                </div>
              </button>
            {/each}
          </div>
        {/if}
      {/each}
      <div class="p-4">
        <button
          class="button disabled:border-secondary disabled:bg-secondary disabled:cursor-not-allowed"
          disabled="{!data.lazy.info?.current}"
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
          await publish(!isPublish);
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
          invalidate('data:scheduler');
        }
      }}"
    >
      Reset
    </button>
  </div>
  {#if state.section}
    <div
      class="border-primary bg-light flex justify-between gap-2 overflow-hidden rounded border pr-2 font-semibold shadow"
    >
      <span class="bg-primary px-3 py-2 font-semibold text-white">Selected</span>
      <span class="truncate py-2">
        {state.section?.subject.code ?? ''}
        {state.section?.subject.name ?? ''}
      </span>
      <span class="py-2">{state.section?.group?.name ?? ''}</span>
      <span class="whitespace-nowrap py-2">SEC {state.section?.no ?? ''}</span>
      <span class="whitespace-nowrap py-2 capitalize"
        >{state.section?.type} {state.section?.lab ?? ''}</span
      >
      <button class="text-blue-600" on:click="{() => submitData()}"> OK </button>
      <button class="text-red-600" on:click="{() => resetState()}"> Cancel </button>
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

<Modal bind:open="{showState}">
  <div id="show-modal" class="my-8 p-4">
    <GenerateModal sections="{data.section.data}" schedule="{scheduler}" group="{group}" />
  </div>
</Modal>

<Modal bind:open="{newState}">
  {#if newState}
    <div id="new" class="p-4">
      <h1 class="mb-4 block text-center text-2xl font-bold">New Section</h1>
      <div class="mx-auto max-w-screen-md">
        {#await formOptions()}
          Loading...
        {:then options}
          <SectionNewForm
            groupOptions="{options.group}"
            roomOptions="{options.room}"
            subjectOptions="{options.subject}"
            instructorOptions="{options.instructor}"
            callback="{async () => {
              newState = !newState;
              await invalidate('data:timetable');
            }}"
          />
        {/await}
      </div>
    </div>
  {/if}
</Modal>

<ModalCenter bind:open="{showRoomState}">
  {#await data.lazy.room}
    Loading...
  {:then roomData}
    <ShowRoom
      scheduler="{scheduler}"
      room="{roomData.data}"
      state="{state}"
      bind:open="{showRoomState}"
    />
  {/await}
</ModalCenter>

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

<style lang="postcss">
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
