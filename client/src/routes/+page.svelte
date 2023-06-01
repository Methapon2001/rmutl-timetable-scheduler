<script lang="ts">
  import type { PageData } from './$types';
  import type { ComponentProps } from 'svelte';
  import Select from '$lib/components/Select.svelte';
  import Table from './timetable/Table.svelte';

  export let data: PageData;

  let state: ComponentProps<Table>['state'] = {
    selected: false,
    section: null,
    weekday: 'mon',
    period: 0,
    size: 0,
  };

  let viewState: string;
  let groupState: string;
  let instructorState: string;

  const instructorMap = data.scheduler.data.reduce<
    Record<string, Omit<API.Instructor, 'createdAt' | 'createdBy' | 'updatedAt' | 'updatedBy'>> // eslint-disable-line no-undef
  >((acc, curr) => {
    curr.section.instructor.forEach((inst) => {
      if (!acc[`${inst.id}`]) acc[`${inst.id}`] = inst;
    });

    return acc;
  }, {});

  const instructorOptions = Object.values(instructorMap).map((inst) => ({
    label: inst.name,
    value: inst.id,
  }));

  const groupMap = data.scheduler.data.reduce<
    Record<string, Omit<API.Group, 'createdAt' | 'createdBy' | 'updatedAt' | 'updatedBy'>> // eslint-disable-line no-undef
  >((acc, curr) => {
    if (curr.section.group && !acc[`${curr.section.group.id}`]) {
      acc[`${curr.section.group.id}`] = curr.section.group;
    }

    return acc;
  }, {});

  const groupOptions = Object.values(groupMap).map((grp) => ({
    label: grp.name,
    value: grp.id,
  }));

  const scheduler = data.scheduler.data.map((obj) => ({
    id: obj.id,
    weekday: obj.weekday,
    period: obj.start,
    size: obj.end - obj.start + 1,
    section: obj.section,
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
  <div class="w-full p-4">
    <span class="text-lg font-semibold">Group : {groupMap[groupState]?.name}</span>
    <Table
      data="{scheduler}"
      state="{state}"
      small="{false}"
      selectable="{false}"
      group="{groupMap[groupState]}"
    />
  </div>
{/if}
{#if instructorState && viewState == 'Instructor View'}
  <div class="w-full p-4">
    <span class="text-lg font-semibold">Group : {groupMap[groupState]?.name}</span>
    <Table
      data="{scheduler}"
      state="{state}"
      small="{false}"
      selectable="{false}"
      instructor="{instructorMap[instructorState]}"
    />
  </div>
{/if}
