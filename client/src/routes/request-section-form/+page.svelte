<script lang="ts">
  import { getZodErrorMessage } from '$lib/utils/zod';
  import { ZodError, z } from 'zod';
  import type { PageData } from './$types';
  import Select from '$lib/components/Select.svelte';
  import { PUBLIC_API_HOST } from '$env/static/public';
  import toast from 'svelte-french-toast';

  export let data: PageData;

  const subjectOptions = data.subject.data.map((val) => ({
    label: `${val.code} ${val.name}`,
    value: val.id,
  }));

  const instructorOptions = data.instructor.data.map((val) => ({
    label: val.name,
    value: val.id,
  }));

  const schema = z.object({
    subjectId: z.string().nonempty({ message: 'Must select one of the options.' }),
    instructorId: z.string().nonempty({ message: 'Must select one of the options.' }),
  });

  const form: { data: z.infer<typeof schema>; error: ZodError | undefined } = {
    data: {
      subjectId: '',
      instructorId: '',
    },
    error: undefined,
  };

  async function handleSubmit() {
    form.error = undefined;

    const result = schema.safeParse(form.data);

    if (!result.success) {
      form.error = result.error;
      return;
    }

    const res = await fetch(`${PUBLIC_API_HOST}/api/request-section?key=${data.key}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(result.data),
    });

    if (!res.ok) {
      toast.error('Failed to submit form. Something went wrong.');
      console.error(res.json());
    } else {
      form.data = {
        subjectId: '',
        instructorId: '',
      };
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
    <div
      class="col-span-4"
      class:invalid="{form.error && getZodErrorMessage(form.error, ['subjectId']).length > 0}"
    >
      <Select
        options="{subjectOptions}"
        bind:value="{form.data.subjectId}"
        placeholder="Select Subject"
      />
    </div>
    <div class="col-span-4 col-start-3 text-red-600">
      {form.error ? getZodErrorMessage(form.error, ['subjectId']) : ''}
    </div>
  </section>
  <section id="input-instructor" class="grid grid-cols-6">
    <div class="col-span-2 flex items-center">
      <label for="" class="font-semibold">
        Requested Instructor <span class="text-red-600">*</span>
      </label>
    </div>
    <div
      class="col-span-4"
      class:invalid="{form.error && getZodErrorMessage(form.error, ['instructorId']).length > 0}"
    >
      <Select
        options="{instructorOptions}"
        bind:value="{form.data.instructorId}"
        placeholder="Select Instructor"
      />
    </div>
    <div class="col-span-4 col-start-3 text-red-600">
      {form.error ? getZodErrorMessage(form.error, ['subjectId']) : ''}
    </div>
  </section>
  <button type="submit" class="button w-full">Save</button>
</form>
