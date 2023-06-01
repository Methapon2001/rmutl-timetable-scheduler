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

  export let subjects: Record<
    string,
    Omit<API.Subject, 'createdAt' | 'createdBy' | 'updatedAt' | 'updatedBy'> // eslint-disable-line no-undef
  >;
</script>

<div>
  <h1 class=" mb-4 block text-center text-2xl font-bold">{planData.name}</h1>
  {#each planData.detail as plan}
    <div class="mb-4 grid grid-cols-4 gap-4 rounded border p-4 text-lg">
      <div class="text-left font-semibold">Year</div>
      <div class="col-span-3">{plan.year}</div>
      <div class="text-left font-semibold">Semester</div>
      <div class="col-span-3">{plan.semester}</div>
      <div class="py-2 text-left font-semibold">Subjects</div>
      <div class="col-span-3 rounded border px-4 py-2">
        {#each plan.subjectId as subject}
          <p>{subjects[subject].code} {subjects[subject].name}</p>
        {/each}
      </div>
    </div>
  {/each}
</div>
