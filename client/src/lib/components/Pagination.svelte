<script lang="ts">
  import ChevronIcon from '$lib/icons/ChevronIcon.svelte';

  export let current: number;
  export let range: number;
  export let total: number;

  let start: number;
  let end: number;

  $: start = Math.max(1, current - range);
  $: end = Math.min(total, current + range);
</script>

<div class="flex justify-center gap-2 p-6" data-sveltekit-reload>
  <a
    class="flex h-8 w-8 items-center justify-center rounded-full leading-tight hover:bg-slate-100"
    href="?page={start}"
  >
    <ChevronIcon direction="left" doubled />
  </a>
  <a
    class="flex h-8 w-8 items-center justify-center rounded-full leading-tight hover:bg-slate-100"
    href="?page={Math.max(start, current - 1)}"
  >
    <ChevronIcon direction="left" />
  </a>
  {#each Array(end - start + 1) as _, i}
    <a
      class="flex h-8 w-8 items-center justify-center rounded-full font-semibold leading-tight transition duration-150 {current ==
      start + i
        ? 'bg-slate-100'
        : 'hover:bg-slate-100'}"
      href="?page={start + i}"
    >
      {start + i}
    </a>
  {/each}
  <a
    class="flex h-8 w-8 items-center justify-center rounded-full leading-tight hover:bg-slate-100"
    href="?page={Math.min(total, current + 1)}"
  >
    <ChevronIcon direction="right" />
  </a>
  <a
    class="flex h-8 w-8 items-center justify-center rounded-full leading-tight hover:bg-slate-100"
    href="?page={end}"
  >
    <ChevronIcon direction="right" doubled />
  </a>
</div>
