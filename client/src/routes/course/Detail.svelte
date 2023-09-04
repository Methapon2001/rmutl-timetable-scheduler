<script lang="ts">
  import type { Course, CourseDetail, LogInfo, Subject } from '$lib/types';

  export let course: LogInfo<
    Course & {
      detail: (CourseDetail & { subject: Subject })[];
    }
  >;

  let sorted = course.detail.sort(
    (a, b) => a.subject.code.localeCompare(b.subject.code) || a.type.localeCompare(b.type),
  );
</script>

<div>
  <div>
    <h1 class="mb-4 block text-center text-2xl font-bold">{course.name}</h1>
  </div>
  <div class="grid grid-cols-3">
    {#each sorted as val}
      <p class="col-span-2 text-left">{val.subject.code} {val.subject.name}</p>
      <p class="text-right capitalize">{val.type}</p>
    {/each}
  </div>
</div>
