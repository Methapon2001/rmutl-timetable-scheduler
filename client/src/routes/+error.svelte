<script>
  import { page } from '$app/stores';
</script>

<div class="h-full p-16 text-center">
  <h1 class="mb-6 text-5xl font-bold text-slate-900">{$page.status}</h1>
  <span class="text-3xl font-semibold text-slate-600">{$page.error?.message}</span>
</div>
