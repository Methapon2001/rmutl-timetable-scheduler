<script lang="ts">
  import { invalidate } from '$app/navigation';
  import { deleteScheduler } from '$lib/api/scheduler';
  import CrossIcon from '$lib/icons/CrossIcon.svelte';
  import { processOverlaps } from '$lib/utils/table';
  import { createEventDispatcher } from 'svelte';

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

  const dispatch = createEventDispatcher<{
    select: {
      weekday: WeekdayShort;
      period: number;
    };
  }>();

  const weekdayMapRow: Record<WeekdayShort, string> = {
    mon: '2/3',
    tue: '3/4',
    wed: '4/5',
    thu: '5/6',
    fri: '6/7',
    sat: '7/8',
    sun: '8/9',
  };

  export let selectable = false;
  export let small = false;
  export let data: {
    id: string;
    section: SectionData;
    weekday: WeekdayShort;
    period: number;
    size: number;
  }[];
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
  export let noDelete = false;

  export let group: API.Scheduler['section']['group'] | undefined = undefined; // eslint-disable-line no-undef
  export let room: API.Scheduler['section']['room'] | undefined = undefined; // eslint-disable-line no-undef
  export let instructor: API.Scheduler['section']['instructor'][number] | undefined = undefined; // eslint-disable-line no-undef

  $: visualize =
    (room && room.id) === state.section?.room?.id ||
    (group && group?.id === state.section?.group?.id) ||
    state.section?.instructor.findIndex((inst) => inst.id === instructor?.id) != -1;

  $: localData =
    room || group || instructor
      ? data.filter(
          (obj) =>
            (room && room.id === obj.section.room?.id) ||
            (group && group.id === obj.section.group?.id) ||
            obj.section.instructor.findIndex((inst) => inst.id == instructor?.id) != -1,
        )
      : data;

  $: processedData = processOverlaps(localData);

  function handleClick(weekday: string, period: number) {
    if (!selectable || !visualize) return;

    dispatch('select', {
      weekday: weekday as WeekdayShort,
      period: period,
    });
  }
</script>

<div class="relative grid w-full bg-white" class:small="{small}" class:disabled="{!visualize}">
  <div class="col-span-3 select-none bg-slate-100 font-semibold capitalize"><!--Period--></div>
  {#each { length: 25 } as _, period}
    <div class="flex flex-col items-center bg-slate-100 font-semibold">
      <small>{period + 1}</small>
      <small class="text-secondary" hidden="{small}"
        >{8 + Math.floor(period / 2)}:{period % 2 === 0 ? '0' : '3'}0</small
      >
    </div>
  {/each}

  {#each Object.keys(weekdayMapRow) as weekday}
    <div
      class="col-span-3 select-none bg-slate-100 font-semibold capitalize"
      class:text-sm="{small}"
    >
      {weekday}
    </div>
    {#each { length: 25 } as _, period}
      <button
        class="cursor-default transition-none hover:bg-slate-100"
        on:click="{() => handleClick(weekday, period + 1)}"></button>
    {/each}
  {/each}

  {#if selectable && state.selected && visualize}
    <div
      class="pointer-events-none absolute z-30 w-full {state.isOverlap || state.isOverflow
        ? 'bg-red-600/70'
        : 'bg-green-600/70'}"
      style:grid-row="{weekdayMapRow[state.weekday]}"
      style:grid-column="{`${state.period + 3}/${state.period + state.size + 3}`}"
    >
      <div class="h-full w-full"></div>
    </div>
  {/if}

  <div
    class="pointer-events-none absolute z-10 w-full border bg-gray-300 text-xs font-bold"
    style:grid-row="{weekdayMapRow['wed']}"
    style:grid-column="18/22"
    style:height="100%"
  >
    <div class="flex items-center justify-center">Activity</div>
  </div>
  {#each processedData as item}
    {@const overlapMaxOffset =
      Math.max(
        ...processedData.filter((obj) => obj.weekday === item.weekday).map((obj) => obj._offset),
      ) + 1}
    <div
      class="pointer-events-none absolute z-10 w-full border bg-blue-300 text-xs font-bold"
      style:grid-row="{weekdayMapRow[item.weekday]}"
      style:grid-column="{`${item.period + 3}/${item.period + item.size + 3}`}"
      style:height="{item._overlap ? `${(100 / overlapMaxOffset).toPrecision(6)}%` : '100%'}"
      style:top="{item._overlap
        ? `${((item._offset * 100) / overlapMaxOffset).toPrecision(6)}%`
        : '0%'}"
    >
      {#if !small}
        <div class="relative flex h-full w-full items-center text-center">
          <div class="flex h-full flex-grow items-center overflow-hidden">
            <div class="w-full">
              {#if !item._overlap}
                <h6 class="block overflow-hidden font-bold">
                  {item.section.subject.code}_SEC_{item.section.no}{item.section.type === 'lab'
                    ? `_L${item.section.lab}`
                    : ''}
                </h6>
              {/if}
              <p class="block">{item.section.subject.name}</p>
            </div>
          </div>
          {#if selectable && !noDelete}
            <div class="pointer-events-auto p-1 pl-0">
              <button
                class="rounded bg-red-600 p-0.5 text-white"
                on:click="{async () => {
                  await deleteScheduler({ id: item.id });
                  await invalidate('data:scheduler');

                  state = {
                    period: item.period,
                    size: item.size,
                    weekday: item.weekday,
                    section: item.section,
                    selected: false,
                  };
                }}"
              >
                <CrossIcon height="{18}" width="{18}" />
              </button>
            </div>
          {/if}
        </div>
      {:else}
        <div
          class="pointer-events-auto relative flex h-full w-full items-center overflow-x-auto overflow-y-hidden text-center text-xs"
        >
          <div class="flex-grow">
            {#if !item._overlap}
              {item.section.subject.code}_SEC_{item.section.no}{item.section.type === 'lab'
                ? `_L${item.section.lab}`
                : ''}
            {:else}
              {item.section.subject.code}_SEC_{item.section.no}{item.section.type === 'lab'
                ? `_L${item.section.lab}`
                : ''}
            {/if}
          </div>
        </div>
      {/if}
    </div>
  {/each}
</div>

<style lang="postcss">
  .grid {
    border-width: 1px 0 0 1px;
    grid-template-columns: repeat(28, minmax(0, 1fr));
    height: 480px;
  }

  .grid > * {
    border-width: 0 1px 1px 0;
    display: flex;
    justify-content: center;
    align-items: center;
    outline: none;
    height: 60px;
    transition: none;
  }

  .grid.disabled {
    background-color: #f3f3f7;
    opacity: 0.5;
  }

  .grid.small {
    height: 192px;
  }

  .grid.small > * {
    height: 24px;
  }
</style>
