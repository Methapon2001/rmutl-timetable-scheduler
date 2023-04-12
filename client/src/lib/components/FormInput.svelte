<script lang="ts">
  export let label: string;
  export let required: boolean = false;
  export let error: string = '';

  $: {
    console.log(error);
  }
</script>

<div class="grid grid-cols-4">
  <div class="col-span-1 flex items-center">
    <label for="" class="font-semibold">
      {label}
      {#if required}<span class="text-red-600">*</span>{/if}
    </label>
  </div>
  <div class="col-span-3 flex items-center">
    <slot name="input" />
  </div>
  <div class="col-start-2 col-span-3">
    <small class="block font-semibold text-red-600">{error}</small>
  </div>
</div>
