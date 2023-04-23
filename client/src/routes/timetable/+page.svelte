<script lang="ts">
  import type { ComponentProps } from 'svelte';
  import type { PageData } from './$types';
  import Table from './Table.svelte';

  export let data: PageData;

  let scheduler: ComponentProps<Table>['data'] = data.scheduler.data.map((obj) => {
    return {
      id: obj.id,
      weekday: obj.weekday,
      period: obj.start,
      size: obj.end - obj.start + 1,
      section: obj.section,
    };
  });

  let instructor = scheduler.reduce<
    Omit<API.Instructor, 'createdAt' | 'createdBy' | 'updatedAt' | 'updatedBy'>[]
  >((acc, curr) => {
    return acc
      .concat(curr.section.instructor)
      .filter((a, idx, arr) => arr.findIndex((b) => b.id === a.id) === idx);
  }, []);

  let room = scheduler.reduce<
    Omit<API.Room, 'createdAt' | 'createdBy' | 'updatedAt' | 'updatedBy'>[]
  >((acc, curr) => {
    return acc
      .concat(curr.section.room ?? [])
      .filter((a, idx, arr) => arr.findIndex((b) => b.id === a.id) === idx);
  }, []);

  let group = scheduler.reduce<
    Omit<API.Group, 'createdAt' | 'createdBy' | 'updatedAt' | 'updatedBy'>[]
  >((acc, curr) => {
    return acc
      .concat(curr.section.group ?? [])
      .filter((a, idx, arr) => arr.findIndex((b) => b.id === a.id) === idx);
  }, []);

  let state: ComponentProps<Table>['state'] = {
    period: 0,
    size: 0,
    weekday: 'sun',
    section: data.section.data[0],
    selected: false,
    status: true,
  };
</script>

<div class="flex">
  <div class="flex-grow">
    <div>
      <div class="grid grid-cols-2 z-20 shadow">
        <div class="table-small-container border-b border-r">
          {#each instructor as i (i.id)}
            <div>
              <h6 class="font-semibold text-center">Instructor - {i.name}</h6>
              <Table
                bind:data={scheduler}
                small={true}
                bind:state
                selectable={true}
                instructor={i}
              />
            </div>
          {/each}
          {#each instructor as i (i.id)}
            <div>
              <h6 class="font-semibold text-center">Instructor - {i.name}</h6>
              <Table
                bind:data={scheduler}
                small={true}
                bind:state
                selectable={true}
                instructor={i}
              />
            </div>
          {/each}
        </div>
        <div class="table-small-container border-b">
          {#each room as r (r.id)}
            <div>
              <h6 class="font-semibold text-center">Room - {r.building.code}-{r.name}</h6>
              <Table bind:data={scheduler} small={true} bind:state selectable={true} room={r} />
            </div>
          {/each}
        </div>
      </div>
      <div class="main-table-container">
        {#each group as g (g.id)}
          <div class="p-4">
            <h6 class="font-semibold text-center">Group - {g.name}</h6>
            <Table bind:data={scheduler} bind:state selectable={true} group={g} />
          </div>
        {/each}
      </div>
    </div>
  </div>
  <div>
    <div class="section-selector">
      {#each data.section.data as section}
        <div>
          <h6 class="font-bold">{section.no} | {section.subject.code} {section.subject.name}</h6>
        </div>
      {/each}
    </div>
  </div>
</div>

<style lang="postcss">
  .table-small-container {
    height: calc(169px + 1rem + 1.5rem + 1rem);
    padding: 1rem;
    overflow-y: auto;
  }

  .table-small-container > *:not(:last-child) {
    margin-bottom: 1rem;
  }

  .main-table-container {
    height: calc(100vh - 4rem - (169px + 1rem + 1.5rem + 1rem));
    overflow-y: auto;
  }

  .section-selector {
    padding: 1rem;
    width: 24rem;
    height: calc(100vh - 4rem);
    overflow-y: auto;
  }
</style>
