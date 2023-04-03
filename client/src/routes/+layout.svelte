<script lang="ts">
  import '../app.postcss';
  import type { LayoutData } from './$types';
  import MenuIcon from '$lib/icons/MenuIcon.svelte';
  import Sidebar from '$lib/components/Sidebar.svelte';

  export let data: LayoutData;

  let menu = [
    {
      path: '/',
      text: 'Home',
    },
    {
      path: '/instructor',
      text: 'Instructor',
    },
  ];

  let sidebar = true;

  let innerWidth: number;

  $: if (innerWidth && innerWidth < 768) {
    sidebar = false;
  }
</script>

<svelte:window bind:innerWidth />

{#if innerWidth}
  <div class="main">
    <div
      class="header flex items-center border-b border-b-slate-700 bg-slate-900 px-3 py-2 text-slate-50 shadow-lg"
    >
      <button
        class="rounded-full p-2 outline-none transition hover:bg-slate-800"
        on:click={() => (sidebar = !sidebar)}
      >
        <MenuIcon />
      </button>
      <span class="ml-2 font-bold uppercase">Menu</span>
      <span class="ml-auto font-semibold capitalize">{data.session?.user.username ?? 'Guest'}</span>
    </div>
    <div
      class="sidebar border-r border-r-slate-700 bg-slate-900"
      class:active={sidebar}
      data-sveltekit-reload
    >
      <Sidebar {menu} />
    </div>
    <div class="content">
      <slot />
    </div>
  </div>
{/if}

<style lang="postcss">
  .main {
    position: fixed;
    inset: 0;
    display: grid;
    height: 100vh;
    width: 100%;
    grid-template-areas: 'header header' 'sidebar content';
    grid-template-rows: 3rem auto;
    grid-template-columns: auto 4fr;
  }

  .header {
    grid-area: header;
  }

  .sidebar {
    grid-area: sidebar;
    transition: width 300ms;
    overflow-y: auto;
    width: 0;
  }

  .sidebar.active {
    width: 16rem;
  }

  .content {
    grid-area: content;
    overflow-y: auto;
    min-width: 300px;
  }
</style>
