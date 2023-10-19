<script lang="ts">
  import { type ZodError, z } from 'zod';
  import type { PageData } from './$types';

  import { env } from '$env/dynamic/public';
  import { getZodErrorMessage as getErrMsg } from '$lib/utils/zod';
  import Select from '$lib/components/Select.svelte';

  import toast from 'svelte-french-toast';

  const url = env.PUBLIC_API_HOST ? env.PUBLIC_API_HOST : window.location.origin;

  export let data: PageData;

  const subjectOptions = data.subject.data
    .sort((a, b) => a.name.localeCompare(b.name) || a.code.localeCompare(b.code))
    .map((v) => ({ label: `${v.code} ${v.name}`, value: v.id }));
  const instructorOptions = data.instructor.data
    .sort((a, b) => a.name.localeCompare(b.name))
    .map((v) => ({ label: v.name, value: v.id }));

  const schema = z.object({
    subjectId: z.string().nonempty({ message: 'Must select one of the options.' }),
    instructorId: z.string().nonempty({ message: 'Must select one of the options.' }),
  });

  let validateError: ZodError | null = null;

  $: err = {
    subjectId: getErrMsg(validateError, ['subjectId']),
    instructorId: getErrMsg(validateError, ['instructorId']),
  };

  let subjectId = '';
  let instructorId = '';

  async function handleSubmit() {
    validateError = null;

    const result = schema.safeParse({ subjectId, instructorId });

    if (!result.success) {
      validateError = result.error;
      return;
    }

    const res = await fetch(`${url}/api/request-section?key=${data.key}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(result.data),
    });

    if (!res.ok) {
      toast.error('Failed to submit form. Something went wrong.');
    } else {
      subjectId = instructorId = '';
      toast.success('Form submitted.');
    }
  }
</script>

<svelte:head>
  <title>Request Section Form</title>
</svelte:head>

<form on:submit|preventDefault="{() => handleSubmit()}" class="space-y-4 p-4">
  <h3 class="text-center text-2xl font-bold">Request Section Form</h3>
  <section id="input-subject" class="grid grid-cols-6">
    <div class="col-span-2 flex items-center">
      <label for="" class="font-semibold">
        Requested Subject <span class="text-red-600">*</span>
      </label>
    </div>
    <div class="col-span-4" class:invalid="{err.subjectId}">
      <Select options="{subjectOptions}" placeholder="Select Subject" bind:value="{subjectId}" />
    </div>
    {#if err.subjectId}
      <div class="col-span-4 col-start-3 text-red-600">{err.subjectId.join()}</div>
    {/if}
  </section>
  <section id="input-instructor" class="grid grid-cols-6">
    <div class="col-span-2 flex items-center">
      <label for="" class="font-semibold">
        Requested Instructor <span class="text-red-600">*</span>
      </label>
    </div>
    <div class="col-span-4" class:invalid="{err.subjectId}">
      <Select
        options="{instructorOptions}"
        placeholder="Select Subject"
        bind:value="{instructorId}"
      />
    </div>
    {#if err.instructorId}
      <div class="col-span-4 col-start-3 text-red-600">{err.instructorId.join()}</div>
    {/if}
  </section>
  <button type="submit" class="button w-full">Save</button>
</form>
