<script lang="ts">
  import { fade, fly } from 'svelte/transition';
  import { clickOutside } from '$lib/element';
  import CrossIcon from '$lib/icons/CrossIcon.svelte';

  export let width = '48rem';
  export let open = false;
  export let center = false;
  export let maxWidth: string | undefined = undefined;
</script>

<svelte:window
  on:keydown="{(e) => {
    if (e.code == 'Escape') open = false;
  }}"
/>

{#if open}
  <div class="modal" transition:fade="{{ duration: 150 }}" class:center="{center}">
    <div
      transition:fly="{{ x: center ? 0 : 100, y: center ? 100 : 0 }}"
      class="modal-content {!maxWidth ? 'max-w-md md:max-w-xl' : ''}"
      style:width="{width}"
      style:max-width="{maxWidth ? maxWidth + ' !important' : ''}"
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
    justify-content: right;
    background-color: rgb(0 0 0 / 0.35);
    z-index: 50;
  }

  .modal.center {
    align-items: center;
    justify-content: center;
  }

  .modal .modal-content {
    position: relative;
    height: 100%;
    overflow-y: auto;
    background-color: #fff;
    border-top-left-radius: 0.5rem;
    border-bottom-left-radius: 0.5rem;
  }

  .modal.center .modal-content {
    border-top-right-radius: 0.5rem;
    border-bottom-right-radius: 0.5rem;
    max-height: 80%;
  }

  .modal .modal-content .close {
    position: absolute;
    right: 0.5rem;
    top: 0.5rem;
    padding: 0.5rem;
  }
</style>
