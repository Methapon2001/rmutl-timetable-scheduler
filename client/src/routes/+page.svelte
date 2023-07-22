<script lang="ts">
  import type { PageData } from './$types';
  import type { ComponentProps } from 'svelte';
  import Select from '$lib/components/Select.svelte';
  import Table from './timetable/Table.svelte';
  import TableExam from './exam-timetable/Table.svelte';

  export let data: PageData;

  let state: ComponentProps<Table>['state'] = {
    selected: false,
    section: null,
    weekday: 'mon',
    period: 0,
    size: 0,
  };

  let stateExam: ComponentProps<TableExam>['state'] = {
    selected: false,
    exam: null,
    weekday: 'mon',
    period: 0,
    size: 0,
  };

  let viewState: string;
  let groupState: string;
  let instructorState: string;

  const instructorStudyMap = data.scheduler.data.reduce<
    Record<string, Omit<API.Instructor, 'createdAt' | 'createdBy' | 'updatedAt' | 'updatedBy'>> // eslint-disable-line no-undef
  >((acc, curr) => {
    curr.section.instructor.forEach((inst) => {
      if (!acc[inst.id]) acc[inst.id] = inst;
    });

    return acc;
  }, {});

  const instructorExamMap = data.schedulerExam.data.reduce<
    Record<string, Omit<API.Instructor, 'createdAt' | 'createdBy' | 'updatedAt' | 'updatedBy'>> // eslint-disable-line no-undef
  >((acc, curr) => {
    curr.exam.instructor.forEach((inst) => {
      if (!acc[inst.id] && !instructorStudyMap[inst.id]) acc[inst.id] = inst;
    });

    return acc;
  }, {});

  const groupStudyMap = data.scheduler.data.reduce<
    Record<string, Omit<API.Group, 'createdAt' | 'createdBy' | 'updatedAt' | 'updatedBy'>> // eslint-disable-line no-undef
  >((acc, curr) => {
    if (curr.section.group && !acc[curr.section.group.id]) {
      acc[curr.section.group.id] = curr.section.group;
    }

    return acc;
  }, {});

  const groupExamMap = data.schedulerExam.data.reduce<
    Record<string, Omit<API.Group, 'createdAt' | 'createdBy' | 'updatedAt' | 'updatedBy'>> // eslint-disable-line no-undef
  >((acc, curr) => {
    curr.exam.section.forEach((sec) => {
      if (sec.group && !acc[sec.group.id] && !acc[sec.group.id]) acc[sec.group.id] = sec.group;
    });

    return acc;
  }, {});

  const scheduler = data.scheduler.data.map((obj) => ({
    id: obj.id,
    weekday: obj.weekday,
    period: obj.start,
    size: obj.end - obj.start + 1,
    section: obj.section,
  }));

  const schedulerExam = data.schedulerExam.data.map((obj) => ({
    id: obj.id,
    weekday: obj.weekday,
    period: obj.start,
    size: obj.end - obj.start + 1,
    exam: obj.exam,
  }));

  const instructorMap = {
    ...instructorStudyMap,
    ...instructorExamMap,
  };

  const groupMap = {
    ...groupStudyMap,
    ...groupExamMap,
  };

  const instructorOptions = Object.values(instructorMap).map((inst) => ({
    label: inst.name,
    value: inst.id,
  }));

  const groupOptions = Object.values(groupMap).map((grp) => ({
    label: grp.name,
    value: grp.id,
  }));
</script>

<div class="flex w-full items-end justify-center space-x-4 p-4">
  <div class="w-80">
    <span class="font-semibold">Select View :</span>
    <Select
      options="{['Instructor View', 'Student View']}"
      placeholder="Select View"
      bind:value="{viewState}"
    />
  </div>
  {#if viewState == 'Student View'}
    <div class="w-80">
      <span class="font-semibold">Select Group :</span>
      <Select options="{groupOptions}" placeholder="Select Group" bind:value="{groupState}" />
    </div>
  {/if}
  {#if viewState == 'Instructor View'}
    <div class="w-80">
      <span class="font-semibold">Select Instructor :</span>
      <Select
        options="{instructorOptions}"
        placeholder="Select Instructor"
        bind:value="{instructorState}"
      />
    </div>
  {/if}
</div>
{#if groupState && viewState == 'Student View'}
  <div class="w-full space-y-4 p-4">
    <h3 class="text-xl font-semibold">Study:</h3>
    <div class="rounded border p-4">
      {#if groupStudyMap[groupState]}
        <Table
          data="{scheduler}"
          state="{state}"
          small="{false}"
          selectable="{false}"
          group="{groupStudyMap[groupState]}"
        />
      {:else}
        <span>Data not found.</span>
      {/if}
    </div>

    <h3 class="rounded text-xl font-semibold">Exam:</h3>
    <div class="rounded border p-4">
      {#if groupExamMap[groupState]}
        <TableExam
          data="{schedulerExam}"
          state="{stateExam}"
          small="{false}"
          selectable="{false}"
          group="{groupExamMap[groupState]}"
        />
      {:else}
        <span>Data not found.</span>
      {/if}
    </div>
  </div>
{/if}

{#if instructorState && viewState == 'Instructor View'}
  <div class="w-full space-y-4 p-4">
    <h3 class="text-xl font-semibold">Lecture:</h3>
    <div class="rounded border p-4">
      {#if instructorMap[instructorState]}
        <Table
          data="{scheduler}"
          state="{state}"
          small="{false}"
          selectable="{false}"
          instructor="{instructorStudyMap[instructorState]}"
        />
      {:else}
        <span>Data not found.</span>
      {/if}
    </div>

    <h3 class="rounded text-xl font-semibold">Exam:</h3>
    <div class="rounded border p-4">
      {#if instructorExamMap[instructorState]}
        <TableExam
          data="{schedulerExam}"
          state="{stateExam}"
          small="{false}"
          selectable="{false}"
          instructor="{instructorExamMap[instructorState]}"
        />
      {:else}
        <span>Data not found.</span>
      {/if}
    </div>
  </div>
{/if}
