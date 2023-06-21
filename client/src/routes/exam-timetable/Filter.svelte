<script lang="ts">
  export let show = false;
  export let list: { group: string; options: { label: string; value: string }[] }[] = [];
  export let selected: string[] = [];
</script>

{#if show}
  <div class="rounded border p-4">
    <div>
      {#each list as li}
        <h3 class="font-bold">{li.group}</h3>
        {#each li.options as option}
          <label class="block">
            <input type="checkbox" value="{option.value}" bind:group="{selected}" />
            {option.label}
          </label>
        {/each}
      {/each}
    </div>
  </div>
{/if}
