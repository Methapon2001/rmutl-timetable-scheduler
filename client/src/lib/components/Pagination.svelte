<script lang="ts">
  import { page } from '$app/stores';
  import ChevronIcon from '$lib/icons/ChevronIcon.svelte';

  export let current: number;
  export let range: number;
  export let total: number;

  let start: number;
  let end: number;
  let query: string;

  $: start = Math.max(1, current - range);
  $: end = Math.min(total, current + range);
  $: url = $page.url;
  $: {
    url.searchParams.delete('page');
    query = url.searchParams.toString();
    if (query.length > 0) query = `${query}&`;
  }
</script>

{#if total > 0}
  <div>
    <a href="?{query}page={start}"><ChevronIcon direction="left" doubled /></a>
    <a href="?{query}page={Math.max(start, current - 1)}" rel="prev">
      <ChevronIcon direction="left" />
    </a>

    {#each Array(end - start + 1) as _, i}
      <a class:active="{current == start + i}" href="?{query}page={start + i}">
        {start + i}
      </a>
    {/each}

    <a href="?{query}page={Math.min(total, current + 1)}" rel="next">
      <ChevronIcon direction="right" />
    </a>
    <a href="?{query}page={end}"><ChevronIcon direction="right" doubled /></a>
  </div>
{/if}

<style lang="postcss">
  div {
    display: flex;
    justify-content: center;
    gap: 0.5rem;
    padding: 1rem;
  }
  a {
    display: flex;
    height: 2rem;
    width: 2rem;
    border-radius: 50%;
    align-items: center;
    justify-content: center;
    transition: background 150ms;
  }

  a:hover,
  a.active {
    background-color: var(--color-light);
  }
</style>
