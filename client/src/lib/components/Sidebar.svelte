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
        class="flex w-full transition duration-150 rounded-md px-4 py-2 font-semibold {route == path
          ? 'bg-slate-800 text-white'
          : 'hover:bg-slate-100'}"
        href={path}
      >
        {text}
      </a>
    {/if}
  {/each}
</div>
