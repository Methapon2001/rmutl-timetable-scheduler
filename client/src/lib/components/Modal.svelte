<script lang="ts">
  import { fade } from 'svelte/transition';
  import { clickOutside } from '$lib/utils/directives';
  import CrossIcon from '$lib/icons/CrossIcon.svelte';

  let className = '';
  export { className as class };
  export let open = false;
</script>

<svelte:window
  on:keydown={(e) => {
    if (e.code == 'Escape') open = false;
  }}
/>

{#if open}
  <div
    class="fixed inset-0 z-50 flex justify-center bg-slate-900/50 p-8 sm:p-16 md:p-24"
    transition:fade={{ duration: 150 }}
  >
    <div
      class="relative h-fit max-h-full overflow-y-auto rounded-lg bg-white p-4 shadow default:max-w-full {className}"
      on:outclick={() => (open = false)}
      use:clickOutside
    >
      <button class="absolute right-2 top-2 p-2 only:ml-auto" on:click={() => (open = false)}>
        <CrossIcon />
      </button>
      <slot />
    </div>
  </div>
{/if}
