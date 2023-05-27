<script lang="ts">
  export let planData: {
    id: string;
    name: string;
    detail: {
      year: number;
      semester: number;
      subjectId: string[];
    }[];
    courseId: string;
  };
</script>

<div>
  <div>
    <h1 class=" mb-4 block text-center text-2xl font-bold">{planData.name}</h1>
  </div>
  <div>
    <table class="w-full">
      <thead>
        <tr>
          <th>Name</th>
          <th>Year</th>
          <th>Semester</th>
        </tr>
      </thead>
    </table>
  </div>
  <div class="grid grid-cols-5">
    {#each planData.detail as plan}
      <p class=" col-span-2 text-left">{plan.year}</p>
      <p class=" col-span-2 text-left">{plan.semester}</p>
    {/each}
  </div>
</div>
