<script lang="ts">
  import type { ComponentProps } from 'svelte';
  import type { Instructor } from '$lib/types';

  import { checkOverlap } from './utils';
  import Table from './Table.svelte';
  import apiRequest from '$lib/api';
  import { invalidate } from '$app/navigation';

  export let state: ComponentProps<Table>['state'];
  export let scheduler: ComponentProps<Table>['data'];
  export let instructor: Instructor[];
  export let handleSelect: (
    weekday: ComponentProps<Table>['state']['weekday'],
    period: number,
  ) => void = () => {
    // do nothing
  };
  export let callback: (data: unknown) => void = () => {
    // do nothing
  };

  let searchText = '';

  function detectLocalOverlap(current: typeof state, localInstructor: (typeof instructor)[number]) {
    let localState = structuredClone(current);

    if (localState.exam) {
      localState.exam.instructor = [localInstructor];
    }

    localState.isOverflow = localState.period + localState.size - 1 > 25;

    const { isOverlap, overlapGroup, overlapInstructor, overlapRoom, overlapSection } =
      checkOverlap(localState, scheduler);

    localState.isOverlap = isOverlap;
    localState.overlapGroup = overlapGroup;
    localState.overlapInstructor = overlapInstructor;
    localState.overlapRoom = overlapRoom;
    localState.overlapSection = overlapSection;

    return localState;
  }

  function searchMatch(localInstructor: (typeof instructor)[number], text: string) {
    return localInstructor.name.toLowerCase().includes(text.toLowerCase());
  }

  let selectedInstructor = state.exam?.instructor.map((v) => v.id) ?? [];

  async function handleEdit() {
    const exam = state.exam;

    if (!exam) return;

    const ret = await apiRequest('/api/exam').put({
      id: exam.id,
      section: exam.section,
      instructor: selectedInstructor.map((v) => ({ id: v })),
      roomId: exam.room?.id ?? null,
    });

    await invalidate('data:scheduler-exam');
    callback(ret);
  }
</script>

<h1 class="my-3 text-center text-xl font-bold">Instructor List</h1>

<div class="bg-light px-4 py-2">
  <input
    type="text"
    class="input col-span-3 bg-white shadow"
    placeholder="Search"
    bind:value="{searchText}"
  />
</div>

<div class="table-small-container border-b">
  {#each instructor.filter((opt) => searchMatch(opt, searchText)) as i (i.id)}
    {@const st = detectLocalOverlap(state, i)}
    <div id="inst-{i.id}" class="p-4 pr-2" style:scrollbar-gutter="stable">
      <div class="mb-2 flex justify-between">
        <h6 class="text-center font-semibold">
          Instructor - {i.name}
        </h6>
        {#if state.exam}
          <input
            type="checkbox"
            value="{i.id}"
            bind:group="{selectedInstructor}"
            on:change="{handleEdit}"
          />
        {/if}
      </div>
      <Table
        bind:data="{scheduler}"
        state="{st}"
        selectable="{true}"
        instructor="{i}"
        forceVisual="{true}"
        noDelete="{true}"
        on:select="{(e) => handleSelect(e.detail.weekday, e.detail.period)}"
      />
    </div>
  {/each}
</div>
