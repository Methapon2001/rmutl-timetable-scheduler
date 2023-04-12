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
    status: boolean;
    selected: boolean;
    weekday: WeekdayShort;
    period: number;
    size: number;
  }[];
  export let state: {
    status: boolean;
    selected: boolean;
    weekday: WeekdayShort;
    period: number;
    size: number;
  };

  $: localdata = processOverlaps(data);

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

    const localOverlap = data.filter(
      (item) =>
        item.weekday == weekday && item.period + item.size > period && item.period < period + size,
    );

    state.selected = true;
    state.status = localOverlap.length == 0;
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
      <button class="hover:bg-slate-100" on:click={() => handleClick(weekday, period + 1, 4)} />
    {/each}
  {/each}

  {#if selectable && state.selected}
    <div
      class="pointer-events-none absolute z-50 w-full {state.status
        ? 'bg-green-600/70'
        : 'bg-red-600/70'}"
      style:grid-row={weekdayMapRow[state.weekday]}
      style:grid-column={`${state.period + 3}/${state.period + state.size + 3}`}
    >
      <div class="h-full w-full" />
    </div>
  {/if}

  {#each localdata as item}
    {@const overlapMaxOffset = Math.max(...localdata.map((obj) => obj._offset))}
    <div
      class="center absolute z-10 w-full border bg-blue-600 text-xs font-bold text-white"
      style:grid-row={weekdayMapRow[item.weekday]}
      style:grid-column={`${item.period + 3}/${item.period + item.size + 3}`}
      style:height={item._overlap ? `${(100 / overlapMaxOffset).toPrecision(6)}%` : '100%'}
      style:top={item._overlap
        ? `${((item._offset * 100) / overlapMaxOffset).toPrecision(6)}%`
        : '0%'}
    />
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
