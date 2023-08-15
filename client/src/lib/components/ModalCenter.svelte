<script lang="ts">
  import { fade, fly } from 'svelte/transition';
  import { clickOutside } from '$lib/utils/directives';
  import CrossIcon from '$lib/icons/CrossIcon.svelte';

  export let width = '48rem';
  export let open = false;
</script>

<svelte:window
  on:keydown="{(e) => {
    if (e.code == 'Escape') open = false;
  }}"
/>

{#if open}
  <div class="modal" transition:fade="{{ duration: 150 }}">
    <div
      transition:fly="{{ y: 100 }}"
      class="modal-content max-w-md md:max-w-xl"
      style:width="{width}"
      on:outclick="{() => (open = false)}"
      use:clickOutside
    >
      <button class="close" on:click="{() => (open = false)}">
        <CrossIcon />
      </button>
      <slot />
    </div>
  </div>
{/if}

<style>
  .modal {
    position: fixed;
    inset: 0;
    display: flex;
    justify-content: center;
    align-items: center;
    background-color: rgb(0 0 0 / 0.35);
    z-index: 50;
  }

  .modal-content {
    position: relative;
    height: 80%;
    overflow-y: auto;
    background-color: #fff;
    border-radius: 0.5rem;
  }

  .close {
    position: absolute;
    right: 0.5rem;
    top: 0.5rem;
    padding: 0.5rem;
  }
</style>
