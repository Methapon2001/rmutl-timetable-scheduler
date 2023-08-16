<script lang="ts">
  import Table from './Table.svelte';
  import { editSection } from '$lib/api/section';
  import { invalidate } from '$app/navigation';

  type WeekdayShort = 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun';
  type SectionData = Omit<
    API.Section, // eslint-disable-line no-undef
    'createdAt' | 'createdBy' | 'updatedAt' | 'updatedBy'
  >;

  type ScheduleData = {
    section: SectionData | null;
    weekday: WeekdayShort;
    period: number;
    size: number;
  };

  export let state: {
    selected: boolean;
    section: SectionData | null;
    weekday: WeekdayShort;
    period: number;
    size: number;
    isOverflow?: boolean;
    isOverlap?: boolean;
    allowOverlap?: boolean;
    overlapInstructor?: ScheduleData[];
    overlapRoom?: ScheduleData[];
    overlapSubject?: ScheduleData[];
    overlapGroup?: ScheduleData[];
  };

  export let scheduler: {
    id: string;
    section: SectionData;
    weekday: WeekdayShort;
    period: number;
    size: number;
  }[];

  export let room: API.Room[];
  export let open: boolean;

  async function handleSubmit(roomId: string) {
    if (state.section) {
      const ret = await editSection({
        id: state.section.id,
        roomId: roomId,
        groupId: state.section.group?.id ?? null,
      }).catch((r: Response) => console.error(r));

      if (ret) state.section = ret;
    }

    open = !open;
    await invalidate("data:scheduler");
  }
</script>

<h1 class="my-3 text-center text-xl font-bold">Room List</h1>

<div class="table-small-container border-b">
  {#each room.filter((opt) => (state.section && (opt.type == 'both' || opt.type === state.section.room?.type)) || !state.section) as r (r.id)}
    <div id="room-{r.id}" class="p-4 pr-2" style:scrollbar-gutter="stable">
      <div class="mb-2 flex justify-between">
        <h6 class="text-center font-semibold">
          Room - {r.building.code}-{r.name} <span class="capitalize">({r.type})<span>
        </h6>
        {#if state.section}
          <button
            class="bg-primary disabled:bg-secondary rounded px-2 text-white"
            on:click="{() => handleSubmit(r.id)}"
            disabled="{state.section?.room?.id == r.id}">Change</button
          >
        {/if}
      </div>
      <Table
        bind:data="{scheduler}"
        bind:state="{state}"
        small="{true}"
        selectable="{true}"
        room="{r}"
        forceVisual="{true}"
      />
    </div>
  {/each}
</div>
