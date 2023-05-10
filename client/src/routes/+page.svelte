<script lang="ts">
  import { openTemplate } from '$lib/utils/pdf';
</script>

<button on:click="{() => openTemplate()}" class="button">Open PDF</button>
