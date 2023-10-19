<script lang="ts">
  import type { PageData } from './$types';
  import { goto } from '$app/navigation';
  import toast from 'svelte-french-toast';

  import Select from '$lib/components/Select.svelte';
  import SectionNewForm from '../SectionNewForm.svelte';

  export let data: PageData;

  const groupMap = data.group.data.reduce<{ [id: string]: (typeof data)['group']['data'][number] }>(
    (acc, curr) => {
      acc[curr.id] = curr;
      return acc;
    },
    {},
  );

  /**
   * Due to select component only accept string and value is also string.
   * It behave like normal html and js.
   * May update component to accept any type of data dynamically.
   */
  let semester = data.info?.semester.toString();

  /** Year is also string same as semester case earlier */
  let group: string[] = [];
  let detail: {
    year: string;
    groupId: string;
    subjectId: string[];
    form: SectionNewForm[];
  }[] = [];

  async function handleSubmit() {
    const form = detail.flatMap((v) => v.form).filter((v) => v !== null);

    if (form.some((v) => v.isError())) {
      toast.error('Some of the inputs is invalid.');
      return;
    }

    let err = false;
    await Promise.all(
      form.map((v) =>
        v.submit().catch((e) => {
          err = true;
          console.error(e);
          toast.error('An error occured. See console for more detail.');
        }),
      ),
    );

    if (!err) {
      toast.success('Success.');
      semester = '1';
      group = detail = [];
      await goto('/section');
    }
  }
</script>

<svelte:head>
  <title>Generate Section</title>
</svelte:head>

<div class="space-y-4 bg-light p-4">
  <article class="space-y-4 rounded border bg-white p-4">
    <h1 class="mb-4 text-center text-2xl font-bold">Generate Section</h1>

    <section id="input-group" class="grid grid-cols-6">
      <div class="col-span-2 flex items-center">
        <label for="group" class="font-semibold">
          Group <span class="text-red-600">*</span>
        </label>
      </div>
      <div class="col-span-4 grid auto-cols-fr">
        {#each data.group.data as v}
          <label class="whitespace-nowrap px-4 font-semibold">
            <input
              type="checkbox"
              value="{v.id}"
              bind:group="{group}"
              on:change="{() => {
                detail = group.map(
                  (v) =>
                    detail.find((x) => x.groupId === v) ?? {
                      year: '1',
                      groupId: v,
                      subjectId: [],
                      form: [],
                    },
                );
              }}"
            />
            {v.name}
          </label>
        {/each}
      </div>
    </section>
  </article>
  {#if detail.length > 0}
    {#each detail as v}
      {@const subject = groupMap[v.groupId].plan.detail
        .filter((x) => x.semester === +semester && x.year === +v.year)
        .map((x) => x.subject)
        .sort((a, b) => a.name.localeCompare(b.name) || a.code.localeCompare(b.code))}
      <article class="space-y-4 rounded border bg-white p-4">
        <h1 class="text-2xl font-semibold">{groupMap[v.groupId].name}</h1>
        <section id="input-year" class="grid grid-cols-6">
          <div class="col-span-2 flex items-center">
            <label for="year" class="font-semibold">
              Year <span class="text-red-600">*</span>
            </label>
          </div>
          <div class="col-span-4">
            <Select
              options="{[1, 2, 3, 4, 5, 6, 7, 8].map((n) => n.toString())}"
              bind:value="{v.year}"
              placeholder="Select Year"
            />
          </div>
        </section>
        <section id="input-subject" class="grid grid-cols-6">
          <div class="col-span-2 flex items-center">
            <label for="group" class="font-semibold">
              Subject <span class="text-red-600">*</span>
            </label>
          </div>
          <div class="col-span-4 grid auto-cols-fr">
            {#if subject.length === 0}No record{/if}
            {#each subject as s}
              <label class="whitespace-nowrap px-4 font-semibold">
                <input type="checkbox" value="{s.id}" bind:group="{v.subjectId}" />
                {s.code}
                {s.name}
              </label>
            {/each}
          </div>
        </section>
        {#each v.subjectId as subjectId, idx}
          <section class="space-y-4 border-t pt-4">
            <h1 class="sticky top-0 text-lg font-semibold">
              <span class="rounded bg-primary px-2 py-1 text-white">
                {groupMap[v.groupId].name}
              </span>
              {subject.find((s) => s.id === subjectId)?.name}
            </h1>
            <SectionNewForm
              subjectId="{subjectId}"
              groupId="{v.groupId}"
              bind:this="{v.form[idx]}"
              lock
            />
          </section>
        {/each}
      </article>
    {/each}

    {#if detail.some((v) => v.subjectId.length > 0)}
      <button class="button w-full" on:click="{() => handleSubmit()}">Submit</button>
    {/if}
  {/if}
</div>
