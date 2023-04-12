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
    {
      path: '/subject',
      text: 'Subject',
    },
    {
      path: '/building',
      text: 'Building',
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
    <div class="header flex items-center border-b px-3 py-2">
      <button
        class="rounded-full p-2 outline-none transition hover:bg-slate-100"
        on:click={() => (sidebar = !sidebar)}
      >
        <MenuIcon />
      </button>
      <span class="ml-2 font-bold uppercase">Menu</span>
      <span class="ml-auto font-semibold capitalize">{data.session?.user.username ?? 'Guest'}</span>
    </div>
    <div class="sidebar border-r-slate border-r" class:active={sidebar}>
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
