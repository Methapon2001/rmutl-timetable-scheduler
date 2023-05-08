<script lang="ts">
  import { invalidate } from '$app/navigation';
  import { deleteSchedulerExam } from '$lib/api/scheduler-exam';
  import { createEventDispatcher } from 'svelte';

  type WeekdayShort = 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun';
  type ExamData = Omit<
    API.Exam, // eslint-disable-line no-undef
    'createdAt' | 'createdBy' | 'updatedAt' | 'updatedBy'
  >;

  type ScheduleExamData = {
    exam: ExamData | null;
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
    exam: ExamData;
    weekday: WeekdayShort;
    period: number;
    size: number;
  }[];
  export let state: {
    selected: boolean;
    exam: ExamData | null;
    weekday: WeekdayShort;
    period: number;
    size: number;
    isOverflow?: boolean;
    isOverlap?: boolean;
    allowOverlap?: boolean;
    overlapInstructor?: ScheduleExamData[];
    overlapRoom?: ScheduleExamData[];
    overlapSubject?: ScheduleExamData[];
    overlapGroup?: ScheduleExamData[];
    overlapSection?: ScheduleExamData[];
  };

  export let group: API.SchedulerExam['exam']['section'][number]['group'] | undefined = undefined; // eslint-disable-line no-undef
  export let room: API.SchedulerExam['exam']['room'] | undefined = undefined; // eslint-disable-line no-undef
  export let instructor: API.SchedulerExam['exam']['instructor'][number] | undefined = undefined; // eslint-disable-line no-undef

  $: visualize =
    (room && room?.id == state.exam?.room?.id) ||
    state.exam?.section.findIndex((sec) => sec.group && sec.group?.id == group?.id) !== -1 ||
    state.exam?.instructor.findIndex((inst) => inst.id == instructor?.id) !== -1;

  $: localData =
    room || group || instructor
      ? data.filter(
          (obj) =>
            (obj.exam.room && obj.exam.room?.id == room?.id) ||
            obj.exam.section.findIndex((sec) => sec.group && sec.group?.id == group?.id) !== -1 ||
            obj.exam.instructor.findIndex((inst) => inst.id == instructor?.id) !== -1,
        )
      : data;

  $: processedData = processOverlaps(localData);

  function processOverlaps(arr: typeof data) {
    const processed = arr.map((current) => {
      return {
        ...current,
        _overlap: arr.some(
          (item) =>
            item != current &&
            item.weekday == current.weekday &&
            item.period + item.size > current.period &&
            item.period < current.period + current.size,
        ),
        _offset: -1,
      };
    });

    for (let i = 0; i < processed.length; i++) {
      if (processed[i]._overlap == false) continue;

      const offsetList: number[] = [];

      const mutualOverlap = processed.filter(
        (item) =>
          item.weekday == processed[i].weekday &&
          processed[i].period < item.period + item.size &&
          processed[i].period + processed[i].size > item.period,
      );

      mutualOverlap.forEach((item) => {
        if (item._offset != -1) offsetList.push(item._offset);
      });

      let j = 0;

      while (offsetList.includes(j)) j++;

      processed[i]._offset = j;

      // for (let k = 0; k < processed.length; k++) {
      //   if (processed[k]._overlap || processed[i].weekday != processed[k].weekday || i == k)
      //     continue;

      //   if (processed[i].section.subject.id == processed[k].section.subject.id) {
      //     processed[k]._overlap = true;
      //     processed[k]._offset = j;
      //   }
      // }
    }

    return processed;
  }

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
        class="transition-none hover:bg-slate-100"
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

  {#each processedData as item}
    {@const overlapMaxOffset = Math.max(...processedData.map((obj) => obj._offset)) + 1}
    <div
      class="pointer-events-auto absolute z-10 w-full border bg-blue-600 text-xs font-bold text-white"
      style:grid-row="{weekdayMapRow[item.weekday]}"
      style:grid-column="{`${item.period + 3}/${item.period + item.size + 3}`}"
      style:height="{item._overlap ? `${(100 / overlapMaxOffset).toPrecision(6)}%` : '100%'}"
      style:top="{item._overlap
        ? `${((item._offset * 100) / overlapMaxOffset).toPrecision(6)}%`
        : '0%'}"
    >
      {#if !small}
        <div class="group relative flex h-full w-full items-center text-center">
          <div class="flex-grow">
            {#if !item._overlap}
              <h6 class="block font-bold">
                {item.exam.section[0].subject
                  .code}_SEC{#each item.exam.section as sec}_{sec.no}{/each}
              </h6>
            {/if}
            <p class="block">{item.exam.section[0].subject.name}</p>
          </div>

          <div
            class="pointer-events-none absolute hidden h-full w-full items-center justify-center bg-black/30 group-hover:flex"
          >
            <button
              class="pointer-events-auto h-8 rounded bg-red-600 px-2 py-1 text-white hover:bg-red-500"
              on:click="{async () => {
                await deleteSchedulerExam({ id: item.id });
                await invalidate('data:scheduler');

                state = {
                  period: item.period,
                  size: item.size,
                  weekday: item.weekday,
                  exam: item.exam,
                  selected: false,
                };
              }}"
            >
              Delete
            </button>
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
    overflow: hidden;
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
