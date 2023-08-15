<script lang="ts">
  import Table from './Table.svelte';
  import type { ComponentProps } from 'svelte';

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

  let state: ComponentProps<Table>['state'] = {
    selected: false,
    section: null,
    weekday: 'mon',
    period: 0,
    size: 0,
  };

  export let scheduler: {
    id: string;
    section: SectionData;
    weekday: WeekdayShort;
    period: number;
    size: number;
  }[];

  export let room: API.Room[];
</script>

<h1 class="my-3 text-center font-bold text-xl">Room List</h1>

<div class="table-small-container border-b">
  {#each room.filter((obj) => !state.selected || obj.id === state.section?.room?.id) as r (r.id)}
    <div id="room-{r.id}" class="p-4 pr-2" style:scrollbar-gutter="stable">
      <div class="mb-2 flex justify-between">
        <h6 class="text-center font-semibold">Room - {r.building.code}-{r.name} <span class="capitalize">({r.type})</span></h6>
      </div>
      <Table
        bind:data="{scheduler}"
        bind:state="{state}"
        small="{true}"
        selectable="{false}"
        room="{r}"
      />
    </div>
  {/each}
</div>
