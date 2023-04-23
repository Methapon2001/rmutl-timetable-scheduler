<script lang="ts">
  type WeekdayShort = 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun';

  const weekdayMapRow: Record<WeekdayShort, string> = {
    mon: '1/2',
    tue: '2/3',
    wed: '3/4',
    thu: '4/5',
    fri: '5/6',
    sat: '6/7',
    sun: '7/8',
  };

  export let selectable = false;
  export let small = false;
  export let data: {
    id: string;
    section: API.Scheduler['section']; // eslint-disable-line no-undef
    weekday: WeekdayShort;
    period: number;
    size: number;
  }[];
  export let state: {
    status: boolean;
    selected: boolean;
    section: API.Section | null; // eslint-disable-line no-undef
    weekday: WeekdayShort;
    period: number;
    size: number;
  };

  export let group: API.Scheduler['section']['group'] | undefined = undefined; // eslint-disable-line no-undef
  export let room: API.Scheduler['section']['room'] | undefined = undefined; // eslint-disable-line no-undef
  export let instructor: API.Scheduler['section']['instructor'][number] | undefined = undefined; // eslint-disable-line no-undef

  $: shareSelectedData = data.filter((obj) => {
    return (
      obj.section.room?.id == state.section?.room?.id ||
      obj.section.group?.id == state.section?.group?.id ||
      obj.section.instructor.findIndex(
        (inst) => state.section?.instructor.findIndex((ins) => ins.id === inst.id) !== -1,
      ) !== -1
    );
  });

  $: localData =
    room || group || instructor
      ? data.filter((obj) => {
          return (
            obj.section.room?.id == room?.id ||
            obj.section.group?.id == group?.id ||
            obj.section.instructor.findIndex((inst) => inst.id == instructor?.id) != -1
          );
        })
      : data;

  $: processedData = processOverlaps(localData);

  function processOverlaps(arr: typeof data) {
    const processed = arr.map((current) => {
      return {
        ...current,
        _overlap: arr.some(
          (item) =>
            item != current &&
            item.weekday == current.weekday &&
            item.period + item.size > current.period &&
            item.period < current.period + current.size,
        ),
        _offset: -1,
      };
    });

    for (let i = 0; i < processed.length; i++) {
      if (processed[i]._overlap == false) continue;

      const offsetList: number[] = [];

      const co = processed.filter(
        (item) =>
          item.weekday == processed[i].weekday &&
          processed[i].period < item.period + item.size &&
          processed[i].period + processed[i].size > item.period,
      );

      co.forEach((item) => {
        if (item._offset != -1) offsetList.push(item._offset);
      });

      let j = 0;

      while (offsetList.includes(j)) j++;

      processed[i]._offset = j;
    }
    return processed;
  }

  function handleClick(weekday: string, period: number, size: number) {
    if (!selectable) return;

    const overlap = shareSelectedData.some(
      (item) =>
        item.weekday == weekday && item.period + item.size > period && item.period < period + size,
    );

    state.selected = true;
    state.status = !overlap && period + size - 1 <= 25;
    state.weekday = weekday as WeekdayShort;
    state.period = period;
    state.size = size;
  }
</script>

<div class="relative grid w-full bg-white" class:small>
  {#each Object.keys(weekdayMapRow) as weekday}
    <div class="col-span-3 select-none bg-slate-100 font-semibold capitalize" class:text-sm={small}>
      {weekday}
    </div>
    {#each Array(25) as _, period}
      <button
        class="transition-none hover:bg-slate-100"
        on:click={() => handleClick(weekday, period + 1, 2)}
      />
    {/each}
  {/each}

  {#if selectable && state.selected}
    <div
      class="pointer-events-none absolute z-30 w-full {state.status
        ? 'bg-green-600/70'
        : 'bg-red-600/70'}"
      style:grid-row={weekdayMapRow[state.weekday]}
      style:grid-column={`${state.period + 3}/${state.period + state.size + 3}`}
    >
      <div class="h-full w-full" />
    </div>
  {/if}

  {#each processedData as item}
    {@const overlapMaxOffset = Math.max(...processedData.map((obj) => obj._offset)) + 1}
    <div
      class="absolute z-10 w-full border bg-blue-600 text-xs font-bold text-white"
      style:grid-row={weekdayMapRow[item.weekday]}
      style:grid-column={`${item.period + 3}/${item.period + item.size + 3}`}
      style:height={item._overlap ? `${(100 / overlapMaxOffset).toPrecision(6)}%` : '100%'}
      style:top={item._overlap
        ? `${((item._offset * 100) / overlapMaxOffset).toPrecision(6)}%`
        : '0%'}
    >
      {#if !small}
        <div class="text-center">
          <h6 class="block font-bold">
            {item.section.subject.code}_SEC_{item.section.no}{item.section.type === 'lab'
              ? `_L${item.section.lab}`
              : ''}
          </h6>
          <p class="block whitespace-nowrap">{item.section.subject.name}</p>
        </div>
      {/if}
    </div>
  {/each}
</div>

<style lang="postcss">
  .grid {
    border-width: 1px 0 0 1px;
    grid-template-columns: repeat(28, minmax(0, 1fr));
    height: 420px;
  }

  .grid > * {
    border-width: 0 1px 1px 0;
    display: flex;
    overflow: hidden;
    justify-content: center;
    align-items: center;
    outline: none;
    height: 60px;
  }

  .grid.small {
    height: 168px;
  }

  .grid.small > * {
    height: 24px;
  }
</style>
