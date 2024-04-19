<script lang="ts">
  import type { Course, LogInfo, Plan, PlanDetail, Subject } from '$lib/types';

  export let plan: LogInfo<
    Plan & {
      detail: (PlanDetail & { subject: Subject })[];
      course: Course;
    }
  >;

  const detail = Object.values(
    plan.detail
      .sort((a, b) => b.year - a.year || b.semester - a.semester)
      .reduce<{ [key: string]: { year: number; semester: number; subject: Subject[] } }>(
        (acc, obj) => {
          const key = `${obj.year}-${obj.semester}`;
          if (!acc[key]) {
            acc[key] = { year: obj.year, semester: obj.semester, subject: [] };
          }
          acc[key].subject.push(obj.subject);
          return acc;
        },
        {},
      ),
  );
</script>

<div>
  <h1 class=" mb-4 block text-center text-2xl font-bold">{plan.name}</h1>
  {#each detail as val}
    <div class="mb-4 grid grid-cols-4 gap-4 rounded border p-4">
      <div class="text-left font-semibold">Year</div>
      <div class="col-span-3">{val.year}</div>
      <div class="text-left font-semibold">Semester</div>
      <div class="col-span-3">{val.semester}</div>
      <div class="py-2 text-left font-semibold">Subjects</div>
      <div class="col-span-3 rounded border px-4 py-2">
        {#each val.subject as subject}
          <p>{subject.code} {subject.name}</p>
        {/each}
      </div>
    </div>
  {/each}
</div>
