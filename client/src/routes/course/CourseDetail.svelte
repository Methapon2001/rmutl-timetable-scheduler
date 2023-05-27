<script lang="ts">
  export let courseData: API.Course;

  courseData.detail.sort((a, b) => a.subject.code.localeCompare(b.subject.code) || a.type.localeCompare(b.type));
</script>

<div>
  <div>
    <h1 class="mb-4 block text-center text-2xl font-bold">{courseData.name}</h1>
  </div>
  <div class="grid grid-cols-3">
    {#each courseData.detail as course}
      <p class=" col-span-2 text-left">{course.subject.code} {course.subject.name}</p>
      <p class="text-right capitalize">{course.type}</p>
    {/each}
  </div>
</div>
