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

  export let room: API.Room[]; // eslint-disable-line no-undef
  export let open: boolean;

  async function handleSubmit(roomId: string) {
    if (state.exam) {
      const ret = await editExam({
        id: state.exam.id,
        roomId: roomId,
        instructor: state.exam.instructor,
        section: state.exam.section,
      }).catch((r: Response) => console.error(r));

      if (ret) state.exam = ret;
    }

    open = !open;
    await invalidate('data:scheduler-exam');
  }
</script>

<h1 class="my-3 text-center text-xl font-bold">Room List</h1>

<div class="table-small-container border-b">
  {#each room as r (r.id)}
    <div id="room-{r.id}" class="p-4 pr-2" style:scrollbar-gutter="stable">
      <div class="mb-2 flex justify-between">
        <h6 class="text-center font-semibold">
          Room - {r.building.code}-{r.name} <span class="capitalize">({r.type})</span>
        </h6>
        {#if state.exam}
          <button
            class="rounded bg-primary px-2 text-white disabled:bg-secondary"
            on:click="{() => handleSubmit(r.id)}"
            disabled="{state.exam?.room?.id == r.id}">Change</button
          >
        {/if}
      </div>
      <Table
        bind:data="{scheduler}"
        bind:state="{state}"
        small="{true}"
        forceVisual="{true}"
        selectable="{true}"
        room="{r}"
      />
    </div>
  {/each}
</div>
