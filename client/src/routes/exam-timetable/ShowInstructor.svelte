<script lang="ts">
  import { invalidate } from '$app/navigation';
  import { editExam } from '$lib/api/exam';
  import Table from './Table.svelte';

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

  export let scheduler: {
    id: string;
    exam: ExamData;
    weekday: WeekdayShort;
    period: number;
    size: number;
  }[];

  export let instructor: API.Instructor[]; // eslint-disable-line no-undef

  let currentInstructor: string[] = state.exam?.instructor.map((inst) => inst.id) ?? [];

  async function handleSubmit() {
    if (state.exam) {
      const ret = await editExam({
        id: state.exam.id,
        roomId: state.exam.room?.id ?? null,
        instructor: currentInstructor.map((inst) => ({id: inst})),
        section: state.exam.section,
      }).catch((r: Response) => console.error(r));

      if (ret) state.exam = ret;
    }

    await invalidate('data:schedulerExam');
  }
</script>

<h1 class="my-3 text-center text-xl font-bold">Room List</h1>

<div class="table-small-container border-b">
  {#each instructor as i (i.id)}
    <div id="inst-{i.id}" class="p-4 pr-2" style:scrollbar-gutter="stable">
      <div class="mb-2 flex justify-between">
        <h6 class="font-semibold">Instructor - {i.name}</h6>
        {#if state.exam}
          <input type="checkbox" value="{i.id}" bind:group="{currentInstructor}" on:change="{handleSubmit}"/>
        {/if}
      </div>
      <Table
        bind:data="{scheduler}"
        bind:state="{state}"
        small="{true}"
        forceVisual="{true}"
        selectable="{true}"
        instructor="{i}"
      />
    </div>
  {/each}
</div>
