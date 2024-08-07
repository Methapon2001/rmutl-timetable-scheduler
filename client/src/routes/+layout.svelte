<script lang="ts">
  import '../app.css';
  import type { LayoutData } from './$types';
  import { page } from '$app/stores';
  import { clickOutside } from '$lib/element';
  import MenuIcon from '$lib/icons/MenuIcon.svelte';
  import { Toaster } from 'svelte-french-toast';
  import { invalidateAll } from '$app/navigation';
  import { info } from '$lib/stores';

  export let data: LayoutData;

  let menu = true;
  let innerWidth: number;
  let route: string | null;
  let menuList1 = [
    { path: '/', text: 'Home (หน้าแรก)' },
    { path: '/subject', text: 'Subject (รายวิชา)' },
    { path: '/instructor', text: 'Instructor (ผู้สอน)' },
    { path: '/building', text: 'Building (ตึกเรียน)' },
    { path: '/room', text: 'Room (ห้องเรียน)' },
    { path: '/course', text: 'Course (หลักสูตร)' },
    { path: '/plan', text: 'Plan (แผนการเรียน)' },
    { path: '/group', text: 'Group (กลุ่มเรียน)' },
    { path: '/section', text: 'Section (กลุ่มรายวิชา)' },
    { path: '/request-section', text: 'Request Section (คำขอเปิดรายวิชา)' },
    { path: '/exam', text: 'Exam (การสอบ)' },
    { path: '/timetable', text: 'Timetable (Study)' },
    { path: '/exam-timetable', text: 'Timetable (Exam)' },
  ];

  $: if (innerWidth && innerWidth < 768) {
    menu = false;
  }

  $: route = $page.route.id;
  $: infoData = data.info.data.sort((a, b) => b.year - a.year || b.semester - a.semester);

  let currentInfo = data.info.data.find((inf) => inf.current);
  let selectedInfo = currentInfo ? `${currentInfo.semester}/${currentInfo.year}` : '';
  setInfo();

  async function setInfo() {
    $info = data.info.data.find((inf) => {
      const [semester, year] = selectedInfo.split('/');
      return +semester === inf.semester && +year === inf.year;
    });
    await invalidateAll();
  }
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
        <li>
          <a class:active="{route == '/user'}" href="{'/user'}" role="button">User (ผู้ใช้)</a>
        </li>
        <li>
          <a class:active="{route == '/info'}" href="{'/info'}" role="button"
            >Semester Info (ภาคเรียน)</a
          >
        </li>
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
    <select
      name="info"
      id="info"
      class="rounded border px-4 py-1 text-center"
      bind:value="{selectedInfo}"
      on:change="{setInfo}"
    >
      {#key data.info.total}
        {#each infoData as inf}
          <option value="{`${inf.semester}/${inf.year}`}"
            >{inf.semester}/{inf.year} {inf.current ? '(Current)' : ''}</option
          >
        {/each}
      {/key}
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

<style>
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
