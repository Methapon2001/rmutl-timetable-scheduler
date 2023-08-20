<script lang="ts">
  import type { PageData } from './$types';
  import { PUBLIC_API_WS } from '$env/static/public';
  import { onMount, type ComponentProps, onDestroy } from 'svelte';
  import { createPDF, drawScheduleExam, drawExamDetailTable } from '$lib/utils/pdf';
  import { createSchedulerExam } from '$lib/api/scheduler-exam';
  import { invalidate } from '$app/navigation';
  import toast from 'svelte-french-toast';
  import Modal from '$lib/components/Modal.svelte';
  import ModalCenter from '$lib/components/ModalCenter.svelte';
  import { checkOverlap } from './utils';
  import Table from './Table.svelte';
  import { generate } from './generate';
  import Filter from './Filter.svelte';
  import FilterIcon from '$lib/icons/FilterIcon.svelte';
  import { exportSchedule } from '$lib/api/export-data';
  import ExamNewForm from '../exam/ExamForm.svelte';
  import ShowRoom from './ShowRoom.svelte';
  import { resetData } from '$lib/api/reset';

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

  const sectionOptions = async () => {
    return (await data.lazy.section).data.map((section) => ({
      label: `${section.subject.code} ${section.subject.name} Sec ${section.no}`,
      value: section.id,
      detail: section,
    }));
  };

  const sectionExamFilteredOptions = async () => {
    return (await data.lazy.sectionExamFiltered).data.map((section) => ({
      label: `${section.subject.code} ${section.subject.name} Sec ${section.no}`,
      value: section.id,
      detail: section,
    }));
  };

  const instructorOptions = async () => {
    return (await data.lazy.instructor).data.map((instructor) => ({
      label: instructor.name,
      value: instructor.id,
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

  const formOptions = async () => {
    return {
      section: await sectionOptions(),
      sectionExamFiltered: await sectionExamFilteredOptions(),
      instructor: await instructorOptions(),
      room: await roomOptions(),
    };
  };

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
        ): g is Omit<API.Group, 'createdAt' | 'createdBy' | 'updatedAt' | 'updatedBy'> => // eslint-disable-line no-undef
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
    state.isOverflow = state.period + state.size - 1 > 50;

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
  }

  async function submitData() {
    if (!state.exam) return;
    if (state.isOverlap) return alert('Overlap Detected!!! Not Allowed.');

    await createSchedulerExam({
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

  // eslint-disable-next-line no-undef
  function handleSelectExam(exam: API.SchedulerExam['exam']) {
    if (schedulerExam.findIndex((schedule) => schedule.exam.id === exam.id) !== -1) return;

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

    let inputPrompt = 0;
    if (exam.section[0]?.subject.lecture === 0) {
      inputPrompt = Number(
        prompt('This subject does not have lecture hour. \nPlease input exam hour: '),
      );
    } else {
      inputPrompt = exam.section[0]?.subject.lecture;
    }

    if (inputPrompt === 0) return;

    state.selected = true;
    state.exam = exam;

    state.size = inputPrompt * 4;

    handleDataChange();

    if (pov === 'group') {
      document.querySelector(`#group-${state.exam?.section[0]?.group?.id}`)?.scrollIntoView({
        behavior: 'smooth',
      });
    } else {
      document.querySelector(`#inst-${state.exam?.instructor[0]?.id}`)?.scrollIntoView({
        behavior: 'smooth',
      });
    }
  }

  function exportPDF() {
    const doc = createPDF();

    const { width: pageWidth, height: pageHeight } = doc.internal.pageSize;

    const pageGap = 3;

    let docScheduleExam: ReturnType<typeof drawScheduleExam>;
    let docScheduleExamDetail: ReturnType<typeof drawExamDetailTable>;

    const drawLayout = () => {
      docScheduleExam = drawScheduleExam(
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

      docScheduleExamDetail = drawExamDetailTable(
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
        docScheduleExam,
      );
    };

    group.forEach((grp) => {
      const filtered = schedulerExam.filter(
        (sched) => sched.exam.section.findIndex((sec) => sec.group?.id === grp.id) !== -1,
      );

      if (filtered.length === 0) return;

      drawLayout();

      docScheduleExam.assignSchedule(filtered, 'group', grp);
      docScheduleExamDetail.setHeader(grp.name);
      docScheduleExamDetail.addDetail(filtered, 'group', grp);

      doc.addPage();
    });

    instructor.forEach((inst) => {
      const filtered = schedulerExam.filter(
        (sched) => sched.exam.instructor.findIndex((ins) => ins.id === inst.id) !== -1,
      );

      if (filtered.length === 0) return;

      drawLayout();

      docScheduleExam.assignSchedule(filtered, 'instructor', inst);
      docScheduleExamDetail.setHeader(inst.name);
      docScheduleExamDetail.addDetail(filtered, 'instructor', inst);

      doc.addPage();
    });

    room.forEach((r) => {
      const filtered = schedulerExam.filter((sched) => sched.exam.room?.id === r.id);

      if (filtered.length === 0) return;

      drawLayout();

      docScheduleExam.assignSchedule(filtered, 'room', r);
      docScheduleExamDetail.setHeader(`${r.building.code}-${r.name}`);
      docScheduleExamDetail.addDetail(filtered, 'room', r);

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
      options: group.map((grp) => ({
        value: grp.name,
        label: grp.name,
      })),
    },
    {
      group: 'Instructor',
      options: instructor.map((inst) => ({
        value: inst.name,
        label: inst.name,
      })),
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

    if (filterSelected.length > 0) {
      return filterSelected.some((txt) => filterFn(txt));
    }
    if (searchText && filterSelected.length > 0) {
      return [searchText, ...filterSelected].some((txt) => filterFn(txt));
    }
    return filterFn(searchText);
  });

  let tableSelectState: string;
  let newState = false;
  let editState = false;
  let editData: {
    id: string;
    roomId: string;
    section: string[];
    instructor: string[];
  };

  function showEdit(exam: {
    id: string;
    section: {
      id: string;
    }[];
    instructor: {
      id: string;
    }[];
    roomId: string;
  }) {
    editState = true;
    editData = {
      ...exam,
      section: exam.section.map((sec) => sec.id),
      instructor: exam.instructor.map((inst) => inst.id),
    };
  }
  let showRoomState = false;

  let selectedSectionId: string[] = [];
</script>

<svelte:window on:keydown="{handleKeydown}" />

<div class="flex">
  <div class="flex-grow">
    <div class="relative">
      <div class="z-20 grid grid-cols-2">
        <div class="table-small-container border-b border-r"></div>
        <div class="table-small-container border-b"></div>
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
          <div id="room-{r.id}" class="p-4 pr-2" style:scrollbar-gutter="stable">
            <div class="mb-2 flex justify-between">
              <h6 class="text-center font-semibold">
                Room - {r.building.code}-{r.name} <span class="capitalize">({r.type})</span>
              </h6>
            </div>
            <Table
              bind:data="{schedulerExam}"
              bind:state="{state}"
              on:select="{(e) => handleSelect(e.detail.weekday, e.detail.period)}"
              selectable="{true}"
              room="{r}"
            />
          </div>
        {/each}
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
            class:text-red-600="{schedulerExam.findIndex((sched) => exam.id == sched.exam.id) !==
              -1}"
            on:click="{() => handleSelectExam(exam)}"
          >
            <div
              class="flex h-full w-full items-center justify-center rounded-l border-r font-semibold"
            >
              <small class="block">{exam.room?.building.code ?? ''}-{exam.room?.name ?? ''}</small>
            </div>
            <div class="col-span-3 w-full pl-3 text-left font-semibold">
              {#each exam.instructor as inst}
                <small class="block">{inst.name}</small>
              {/each}
            </div>
            <div
              class="flex h-full w-full items-center justify-center rounded-l border-r font-semibold"
            >
              <button
                class="!text-blue-500 underline disabled:!text-secondary"
                disabled="{(data.session?.user.id != exam.createdBy.id &&
                  data.session?.user.role != 'admin') ||
                  schedulerExam.findIndex((sched) => exam.id == sched.exam.id) !== -1}"
                on:click|stopPropagation="{() =>
                  showEdit({
                    id: exam.id,
                    section: exam.section,
                    instructor: exam.instructor,
                    roomId: exam.room?.id ?? '',
                  })}">Edit</button
              >
            </div>
          </button>
        </div>
      {/each}
      <div class="p-4">
        <button class="button" on:click="{() => (newState = !newState)}">Add Exam</button>
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
        exportSchedule('group', true);
        exportSchedule('instructor', true);
        exportSchedule('room', true);
      }}"
    >
      Export Excel
    </button>
    <button
      class="rounded border bg-red-600 px-4 py-2 font-semibold text-white outline-none transition duration-150 focus:bg-red-700"
      on:click="{async () => {
        const flag = confirm('Are you sure? This action cannot be undone.');

        if (flag) {
          await resetData('schedulerExam');
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
      <span class=" py-2">
        SEC
        {state.exam.section.map((sec) => sec.no).join(', ')}
      </span>

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
      on:click="{() => generate(data.exam.data, schedulerExam, { maxPerDay: maxPerDay })}"
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
        {#await formOptions()}
          Loading...
        {:then options}
          <ExamNewForm
            sectionOptions="{options.section}"
            sectionExamFilteredOptions="{options.sectionExamFiltered}"
            instructorOptions="{options.instructor}"
            roomOptions="{options.room}"
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
    <ShowRoom scheduler="{schedulerExam}" room="{roomData.data}" />
  {/await}
</ModalCenter>

<Modal bind:open="{editState}">
  <div id="edit" class="p-4">
    <h1 class="mb-4 block text-center text-2xl font-bold">Edit Exam</h1>
    {#await formOptions()}
      Loading...
    {:then options}
      <ExamNewForm
        sectionOptions="{options.section}"
        sectionExamFilteredOptions="{options.sectionExamFiltered}"
        instructorOptions="{options.instructor}"
        roomOptions="{options.room}"
        editData="{editData}"
        edit="{true}"
      />
    {/await}
  </div>
</Modal>

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
