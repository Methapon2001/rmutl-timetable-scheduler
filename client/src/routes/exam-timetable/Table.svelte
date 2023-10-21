<script lang="ts">
  import type {
    Building,
    Exam,
    Group,
    Instructor,
    Room,
    Section,
    Subject,
    TimetableExam,
  } from '$lib/types';
  import { createEventDispatcher } from 'svelte';
  import CrossIcon from '$lib/icons/CrossIcon.svelte';

  const dispatch = createEventDispatcher<{
    select: {
      weekday: TimetableExamData['weekday'];
      period: number;
    };
    remove: { id: string };
  }>();

  type TimetableExamData = TimetableExam & {
    exam: Exam & {
      section: (Section & {
        group: Group | null;
        subject: Subject;
      })[];
      instructor: Instructor[];
      room: (Room & { building: Building }) | null;
    };
  };

  const tbGridWeekday: Record<TimetableExamData['weekday'], string> = {
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
  export let data: TimetableExamData[];
  export let state: {
    selected: boolean;
    exam: TimetableExamData['exam'] | null;
    weekday: TimetableExamData['weekday'];
    period: number;
    size: number;
    isOverflow?: boolean;
    isOverlap?: boolean;
    overlapInstructor?: TimetableExamData[];
    overlapRoom?: TimetableExamData[];
    overlapSubject?: TimetableExamData[];
    overlapGroup?: TimetableExamData[];
    overlapSection?: TimetableExamData[];
  };
  export let noDelete = false;
  export let forceVisual = false;

  export let group: Group | undefined = undefined;
  export let room: (Room & { building: Building }) | undefined = undefined;
  export let instructor: Instructor | undefined = undefined;

  $: visualize =
    (room && room?.id == state.exam?.room?.id) ||
    state.exam?.section.findIndex((v) => v.group && v.group.id === group?.id) !== -1 ||
    state.exam?.instructor.findIndex((v) => v.id == instructor?.id) !== -1 ||
    forceVisual;

  $: localData =
    room || group || instructor
      ? data.filter(
          (v) =>
            (v.exam.room && v.exam.room.id === room?.id) ||
            v.exam.section.findIndex((x) => x.group && x.group.id === group?.id) !== -1 ||
            v.exam.instructor.findIndex((x) => x.id === instructor?.id) !== -1,
        )
      : data;

  function handleClick(weekday: string, period: number) {
    if (!selectable || !visualize) return;

    dispatch('select', {
      weekday: weekday as TimetableExam['weekday'],
      period,
    });
  }

  function handleRemove(id: string) {
    dispatch('remove', { id });
  }
</script>

<div class="w-full overflow-y-hidden overflow-x-scroll">
  <div class="relative grid w-full bg-white" class:small="{small}" class:disabled="{!visualize}">
    <div class="sticky left-0 col-span-3 select-none bg-slate-100 font-semibold capitalize">
      <!--Period-->
    </div>
    {#each { length: 50 } as _, period}
      <div class="flex flex-col items-center bg-slate-100 font-semibold">
        <small>{period + 1}</small>
        <small class="text-secondary" hidden="{small}">
          {8 + Math.floor(period / 4)}:{['00', '15', '30', '45'][period % 4]}
        </small>
      </div>
    {/each}

    {#each Object.keys(tbGridWeekday) as weekday}
      <div
        class="sticky left-0 z-40 col-span-3 select-none bg-slate-100 font-semibold capitalize"
        class:text-sm="{small}"
      >
        {weekday}
      </div>
      {#each { length: 50 } as _, period}
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
        style:grid-row="{tbGridWeekday[state.weekday]}"
        style:grid-column="{`${state.period + 3}/${state.period + state.size + 3}`}"
      >
        <div class="h-full w-full"></div>
      </div>
    {/if}

    {#each localData as item}
      <div
        class="pointer-events-none absolute z-10 w-full border bg-blue-300 text-xs font-bold"
        style:grid-row="{tbGridWeekday[item.weekday]}"
        style:grid-column="{`${item.start + 3}/${item.end + 4}`}"
        style:height="100%"
        style:top="0"
      >
        {#if !small}
          <div class="relative flex h-full w-full items-center text-center">
            <div class="flex h-full flex-grow items-center overflow-hidden">
              <div class="w-full">
                <h6 class="block overflow-hidden font-bold">
                  {item.exam.section[0]?.subject.code}_SEC_{item.exam.section
                    .map((v) => v.no)
                    .join(', ')}
                </h6>
                <p class="block">{item.exam.section[0].subject.name}</p>
              </div>
            </div>
            {#if selectable && !noDelete}
              <div class="pointer-events-auto p-1 pl-0">
                <button
                  class="rounded bg-red-600 p-0.5 text-white"
                  on:click="{() => handleRemove(item.id)}"
                >
                  <CrossIcon height="{18}" width="{18}" />
                </button>
              </div>
            {/if}
          </div>
        {:else}
          <div class="group relative flex h-full w-full items-center text-center text-xs">
            <div class="flex-grow">
              {item.exam.section[0]?.subject.code}_SEC_{item.exam.section
                .map((v) => v.no)
                .join(', ')}
            </div>
          </div>
        {/if}
      </div>
    {/each}
  </div>
</div>

<style lang="postcss">
  .grid {
    border-width: 1px 0 0 1px;
    grid-template-columns: repeat(53, minmax(0, 1fr));
    height: 481px;
    width: 175%;
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
    height: 193px;
    width: 200%;
  }

  .grid.small > * {
    height: 24px;
  }
</style>
