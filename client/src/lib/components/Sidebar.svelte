<script lang="ts">
  import { page } from '$app/stores';

  export let menu: {
    path: string;
    text: string;
    disable?: boolean;
  }[];

  let route: string | null;

  $: route = $page.route.id;
</script>

<div class="space-y-2 p-2">
  {#each menu as { path, text, disable }}
    {#if !disable}
      <a
        class="flex w-full rounded-md px-4 py-2 font-semibold text-slate-50 hover:bg-slate-800"
        class:bg-slate-800={route == path}
        href={path}
      >
        {text}
      </a>
    {/if}
  {/each}
</div>
