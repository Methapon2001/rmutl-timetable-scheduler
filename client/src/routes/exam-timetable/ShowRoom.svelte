<script lang="ts">
  import type { ComponentProps } from 'svelte';
  import type { Building, Room } from '$lib/types';

  import { checkOverlap } from './utils';
  import Table from './Table.svelte';
  import apiRequest from '$lib/api';
  import { invalidate } from '$app/navigation';

  export let state: ComponentProps<Table>['state'];
  export let scheduler: ComponentProps<Table>['data'];
  export let room: (Room & { building: Building })[];
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

  function detectLocalOverlap(current: typeof state, localRoom: (typeof room)[number]) {
    let localState = structuredClone(current);

    if (localState.exam) {
      localState.exam.room = localRoom;
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

  function searchMatch(localRoom: (typeof room)[number], text: string) {
    const lowerCase = text.toLowerCase();
    return (
      localRoom.name.toLowerCase().includes(lowerCase) ||
      localRoom.building.code.toLowerCase().includes(lowerCase)
    );
  }

  async function handleEdit(roomId: string) {
    const exam = state.exam;

    if (!exam) return;

    const ret = await apiRequest('/api/exam').put({
      id: exam.id,
      section: exam.section,
      instructor: exam.instructor,
      roomId: roomId,
    });

    await invalidate('data:scheduler-exam');
    callback(ret);
  }
</script>

<h1 class="my-3 text-center text-xl font-bold">Room List</h1>

<div class="bg-light px-4 py-2">
  <input
    type="text"
    class="input col-span-3 bg-white shadow"
    placeholder="Search"
    bind:value="{searchText}"
  />
</div>

<div class="table-small-container border-b">
  {#each room.filter((opt) => searchMatch(opt, searchText)) as r (r.id)}
    {@const st = detectLocalOverlap(state, r)}
    <div id="room-{r.id}" class="p-4 pr-2" style:scrollbar-gutter="stable">
      <div class="mb-2 flex justify-between">
        <h6 class="text-center font-semibold">
          Room - {r.building.code}-{r.name} <span class="capitalize">({r.type})</span>
        </h6>
        {#if state.exam}
          <button
            class="rounded bg-primary px-2 text-white disabled:bg-secondary"
            on:click="{() => handleEdit(r.id)}"
            disabled="{state.exam?.room?.id === r.id}"
          >
            Change
          </button>
        {/if}
      </div>
      <Table
        bind:data="{scheduler}"
        state="{st}"
        selectable="{true}"
        room="{r}"
        forceVisual="{true}"
        noDelete="{true}"
        on:select="{(e) => handleSelect(e.detail.weekday, e.detail.period)}"
      />
    </div>
  {/each}
</div>
