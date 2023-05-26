<script lang="ts">
  export let courseData: API.Course;

  courseData.detail.sort((a, b) => (a.type > b.type ? 1 : b.type > a.type ? -1 : 0));
  courseData.detail.sort((a, b) =>
    a.subject.code > b.subject.code ? 1 : b.subject.code > a.subject.code ? -1 : 0,
  );
</script>

<form>
  <div>
    <h1 class="mb-4 block text-center text-2xl font-bold">{courseData.name}</h1>
  </div>
  <div class= "grid grid-cols-3">
    {#each courseData.detail as course}
      <p class=" col-span-2 text-left">{course.subject.code} {course.subject.name}</p>
      <p class="text-right capitalize">{course.type}</p>
    {/each}
  </div>
</form>
