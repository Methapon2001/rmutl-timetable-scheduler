<script lang="ts">
  import type { PageData } from './$types';
  import type { ComponentProps } from 'svelte';
  import Select from '$lib/components/Select.svelte';
  import Table from './timetable/Table.svelte';
  import TableExam from './exam-timetable/Table.svelte';

  export let data: PageData;

  const dummy = {
    selected: false,
    weekday: 'mon',
    period: 0,
    size: 0,
  } as const;

  let state: ComponentProps<Table>['state'] = { section: null, ...dummy };
  let stateExam: ComponentProps<TableExam>['state'] = { exam: null, ...dummy };

  let viewState: string;
  let groupState: string;
  let instructorState: string;

  const instructorStudyMap = data.scheduler.data.reduce<
    Record<string, (typeof data.scheduler.data)[number]['section']['instructor'][number]>
  >((acc, curr) => {
    curr.section.instructor.forEach((inst) => {
      if (!acc[inst.id]) acc[inst.id] = inst;
    });
    return acc;
  }, {});

  const instructorExamMap = data.schedulerExam.data.reduce<
    Record<string, (typeof data.schedulerExam.data)[number]['exam']['instructor'][number]>
  >((acc, curr) => {
    curr.exam.instructor.forEach((v) => {
      if (!acc[v.id] && !instructorStudyMap[v.id]) acc[v.id] = v;
    });
    return acc;
  }, {});

  const groupStudyMap = data.scheduler.data.reduce<
    Record<string, NonNullable<(typeof data.scheduler.data)[number]['section']['group']>>
  >((acc, curr) => {
    if (curr.section.group && !acc[curr.section.group.id]) {
      acc[curr.section.group.id] = curr.section.group;
    }
    return acc;
  }, {});

  const groupExamMap = data.schedulerExam.data.reduce<
    Record<
      string,
      NonNullable<(typeof data.schedulerExam.data)[number]['exam']['section'][number]['group']>
    >
  >((acc, curr) => {
    curr.exam.section.forEach((v) => {
      if (v.group && !groupStudyMap[v.group.id] && !acc[v.group.id]) acc[v.group.id] = v.group;
    });
    return acc;
  }, {});

  const instructorMap = { ...instructorStudyMap, ...instructorExamMap };
  const groupMap = { ...groupStudyMap, ...groupExamMap };

  const instructorOptions = Object.values(instructorMap).map((v) => ({
    label: v.name,
    value: v.id,
  }));
  const groupOptions = Object.values(groupMap).map((v) => ({
    label: v.name,
    value: v.id,
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
          data="{data.scheduler.data}"
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
          data="{data.schedulerExam.data}"
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
          data="{data.scheduler.data}"
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
          data="{data.schedulerExam.data}"
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
