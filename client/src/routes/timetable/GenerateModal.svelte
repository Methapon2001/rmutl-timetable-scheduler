<script lang="ts">
  import Select from '$lib/components/Select.svelte';
  import { generate } from './generate';

  export let sections: Parameters<typeof generate>[0];
  export let schedule: Parameters<typeof generate>[1];
  export let group: NonNullable<Parameters<typeof generate>[0][number]['group']>[];
  export let ws: WebSocket | undefined = undefined;

  const subjectTypeOptions = ['compulsory', 'elective'] as const;

  let groupId: string;
  let subjectType: (typeof subjectTypeOptions)[number];

  function handleClick() {
    generate(sections, schedule, {
      target: {
        group: group.find((grp) => grp.id === groupId) ?? undefined,
        subjectType: subjectType ? subjectType : undefined,
      },
    }).then(() => {
      ws?.send(JSON.stringify({ update: 1 }));
    });
  }
</script>

<article class="space-y-4">
  <section id="input-group" class="grid grid-cols-6">
    <div class="col-span-2 flex items-center">
      <label for="" class="font-semibold"> Group </label>
    </div>
    <div class="col-span-4">
      <Select
        options="{group.map((v) => ({ label: v.name, value: v.id }))}"
        bind:value="{groupId}"
        placeholder="All"
      />
    </div>
  </section>

  <section id="input-group" class="grid grid-cols-6">
    <div class="col-span-2 flex items-center">
      <label for="" class="font-semibold"> Subject Type </label>
    </div>
    <div class="col-span-4">
      <Select
        options="{subjectTypeOptions.map((v) => ({
          label: v.charAt(0).toLocaleUpperCase() + v.slice(1),
          value: v,
        }))}"
        bind:value="{subjectType}"
        placeholder="All"
      />
    </div>
  </section>

  <button class="button w-full" on:click="{handleClick}">Generate</button>
</article>
