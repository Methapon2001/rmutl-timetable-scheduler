<script lang="ts">
  import '../app.postcss';
  import type { LayoutData } from './$types';
  import { page } from '$app/stores';
  import { clickOutside } from '$lib/utils/directives';
  import MenuIcon from '$lib/icons/MenuIcon.svelte';
  import { Toaster } from 'svelte-french-toast';

  export let data: LayoutData;

  let menu = true;
  let innerWidth: number;
  let route: string | null;
  let menuList1 = [
    { path: '/', text: 'Home' },
    { path: '/subject', text: 'Subject' },
    { path: '/instructor', text: 'Instructor' },
    { path: '/building', text: 'Building' },
    { path: '/room', text: 'Room' },
    { path: '/course', text: 'Course' },
    { path: '/plan', text: 'Plan' },
    { path: '/group', text: 'Group' },
    { path: '/section', text: 'Section' },
    { path: '/request-section', text: 'Request Section' },
    { path: '/exam', text: 'Exam' },
    { path: '/timetable', text: 'Timetable (Study)' },
    { path: '/exam-timetable', text: 'Timetable (Exam)' },
  ];

  $: if (innerWidth && innerWidth < 768) {
    menu = false;
  }

  $: route = $page.route.id;

  let year = data.info.data.find((inf) => inf.current)?.year;
  let semester = data.info.data.find((inf) => inf.current)?.semester;

  let currentInfo = `${semester}/${year}`;
</script>

<svelte:window bind:innerWidth="{innerWidth}" />

<Toaster />

<nav style:width="{menu ? '16rem' : '0'}">
  <ul>
    <li>
      <div id="app-icon"><img src="/favicon.png" alt="icon" /></div>
    </li>
  </ul>

  {#if !data.session}
    <ul>
      {#each [{ path: '/login', text: 'Login' }] as { path, text }}
        <li><a class:active="{route == path}" href="{path}" role="button">{text}</a></li>
      {/each}
    </ul>
  {/if}

  {#if data.session}
    <ul data-sveltekit-preload-data="off">
      {#if data.session.user.role == 'admin'}
        <li><a class:active="{route == '/user'}" href="{'/user'}" role="button">User</a></li>
        <li><a class:active="{route == '/info'}" href="{'/info'}" role="button">Info</a></li>
      {/if}
      {#each [{ path: '/logout', text: 'Logout' }] as { path, text }}
        <li><a class:active="{route == path}" href="{path}" role="button">{text}</a></li>
      {/each}
    </ul>
  {/if}

  <ul>
    {#each menuList1 as { path, text }}
      <li><a class:active="{route == path}" href="{path}" role="button">{text}</a></li>
    {/each}
  </ul>
</nav>

<header style:margin-left="{menu ? '16rem' : '0'}">
  <button
    id="menu-button"
    use:clickOutside
    on:click="{() => (menu = !menu)}"
    on:outclick="{() => {
      if (innerWidth && innerWidth < 768) {
        menu = false;
      }
    }}"
  >
    <MenuIcon />
  </button>

  <div>
    <span class="rounded bg-primary px-4 py-1 font-semibold text-white">Info</span>
    <select name="info" id="info" bind:value="{currentInfo}" class="rounded border px-4 py-1">
      {#each data.info.data as info}
        <option value="{`${info.semester}/${info.year}`}">{info.semester}/{info.year}</option>
      {/each}
    </select>
  </div>

  <a id="user" href="/profile" role="button">
    {data.session?.user.username ?? 'Guest'}
    {#if data.session}({data.session.user.role}){/if}
  </a>
</header>

<main style:margin-left="{menu ? '16rem' : '0'}">
  <slot />
</main>

<style lang="postcss">
  nav {
    color: var(--color-primary-inverse);
    background-color: var(--color-primary);
    box-shadow: var(--shadow);
    position: fixed;
    overflow: hidden;
    top: 0;
    bottom: 0;
    overflow-y: auto;
    scrollbar-gutter: stable;
  }

  nav ul {
    width: 16rem;
    padding: 1rem;
  }

  nav ul:not(:last-child) {
    border-bottom-color: var(--color-primary-hover);
    border-bottom-width: 1px;
  }

  nav ul li:not(:last-child) {
    margin-bottom: 0.5rem;
  }

  nav ul li #app-icon {
    background-color: var(--color-primary-inverse);
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    width: calc(64px + 2rem);
    height: calc(64px + 2rem);
    margin: 0 auto;
  }

  nav ul li #app-icon img {
    width: 64px;
    height: 64px;
  }

  nav ul li a[role='button'] {
    border-radius: var(--rounded);
    display: block;
    white-space: nowrap;
    padding: 0.5rem 1rem;
    font-weight: 600;
  }

  nav ul li a[role='button'].active {
    background-color: var(--color-primary-inverse);
    color: var(--color-primary);
  }

  nav ul li a[role='button']:not(.active):hover {
    background-color: var(--color-primary-hover);
  }

  header {
    background-color: var(--color-primary-inverse);
    box-shadow: var(--shadow);
    display: flex;
    align-items: center;
    justify-content: space-between;
    position: sticky;
    top: 0px;
    height: 4rem;
    padding: 0 1rem;
    z-index: 40;
  }

  header #menu-button {
    color: var(--color-primary);
    background-color: var(--color-default);
    display: flex;
    align-items: center;
    justify-content: center;
    height: 2rem;
    width: 2rem;
    padding: 0;
    border-radius: 50%;
  }

  header #menu-button:hover {
    background-color: var(--color-default-hover);
  }

  header #user {
    text-transform: capitalize;
    user-select: none;
    font-weight: 600;
  }

  main {
    overflow-x: hidden;
    min-height: calc(100vh - 4rem);
  }
</style>
