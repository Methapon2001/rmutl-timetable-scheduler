<script lang="ts">
  import { type ZodError, z } from 'zod';
  import { invalidate } from '$app/navigation';
  import { blurOnEscape } from '$lib/utils/directives';
  import { getZodErrorMessage } from '$lib/utils/zod';
  import { createSubject, editSubject } from '$lib/api/subject';
  import { onMount } from 'svelte';
  import toast from 'svelte-french-toast';

  const schema = z.object({
    id: z.string().nonempty(),
    code: z.string().min(1),
    name: z.string().min(3),
    credit: z.number().min(0),
    lecture: z.number().min(0),
    lab: z.number().min(0),
    learn: z.number().min(0),
    exam: z.number().min(0),
  });

  const newSchema = schema.omit({
    id: true,
  });

  export let edit = false;
  export let editData: typeof form.data = {
    id: '',
    code: '',
    name: '',
    credit: 0,
    lecture: 0,
    lab: 0,
    learn: 0,
    exam: 0,
  };

  export let callback: () => void = function () {
    // do nothing.
  };

  let form: {
    data: z.infer<typeof schema>;
    error: ZodError | undefined;
  } = {
    data: {
      id: '',
      code: '',
      name: '',
      credit: 0,
      lecture: 0,
      lab: 0,
      learn: 0,
      exam: 0,
    },
    error: undefined,
  };

  let firstInput: HTMLInputElement;

  async function handleSubmit() {
    return edit ? await handleEdit() : await handleCreate();
  }

  async function handleCreate() {
    form.error = undefined;

    const result = newSchema.safeParse(form.data);

    if (!result.success) {
      form.error = result.error;
      return;
    }

    const ret = await createSubject(result.data).catch((r: Response) => console.error(r));

    if (ret) {
      form.data = {
        id: '',
        code: '',
        name: '',
        credit: 0,
        lecture: 0,
        lab: 0,
        learn: 0,
        exam: 0,
      };

      await invalidate('data:subject');

      callback();

      firstInput.focus();

      toast.success('Subject Created!');
    } else {
      toast.error('Fail to create subject!');
    }
  }

  async function handleEdit() {
    form.error = undefined;

    const result = schema.safeParse(form.data);

    if (!result.success) {
      form.error = result.error;
      return;
    }

    const ret = await editSubject(result.data).catch((r: Response) => console.error(r));

    if (ret) {
      form.data = {
        id: '',
        code: '',
        name: '',
        credit: 0,
        lecture: 0,
        lab: 0,
        learn: 0,
        exam: 0,
      };

      await invalidate('data:subject');

      callback();

      toast.success('Edit Complete!');
    } else {
      toast.error('Fail to Edit subject!');
    }
  }

  onMount(() => {
    if (edit && editData) {
      form.data = editData;
    }
  });
</script>

<form on:submit|preventDefault="{() => handleSubmit()}" class="space-y-4">
  <section id="input-code" class="grid grid-cols-6">
    <div class="col-span-2 flex items-center">
      <label for="" class="font-semibold">
        Code <span class="text-red-600">*</span>
      </label>
    </div>
    <div class="col-span-4">
      <input
        type="text"
        class="input text-center
        {form.error && getZodErrorMessage(form.error, ['code']).length > 0
          ? 'border border-red-600'
          : ''}"
        bind:value="{form.data.code}"
        bind:this="{firstInput}"
        use:blurOnEscape
      />
    </div>
    <div class="col-span-4 col-start-3 text-red-600">
      {form.error ? getZodErrorMessage(form.error, ['code']) : ''}
    </div>
  </section>

  <section id="input-name" class="grid grid-cols-6">
    <div class="col-span-2 flex items-center">
      <label for="" class="font-semibold">
        Name <span class="text-red-600">*</span>
      </label>
    </div>
    <div class="col-span-4">
      <input
        type="text"
        class="input text-center
        {form.error && getZodErrorMessage(form.error, ['name']).length > 0
          ? 'border border-red-600'
          : ''}"
        bind:value="{form.data.name}"
        use:blurOnEscape
      />
    </div>
    <div class="col-span-4 col-start-3 text-red-600">
      {form.error ? getZodErrorMessage(form.error, ['name']) : ''}
    </div>
  </section>

  <section id="input-credit" class="grid grid-cols-6">
    <div class="col-span-2 flex items-center">
      <label for="" class="font-semibold">
        Credit <span class="text-red-600">*</span>
      </label>
    </div>
    <div class="col-span-4">
      <input
        type="number"
        class="input text-center
        {form.error && getZodErrorMessage(form.error, ['credit']).length > 0
          ? 'border border-red-600'
          : ''}"
        bind:value="{form.data.credit}"
        use:blurOnEscape
      />
    </div>
    <div class="col-span-4 col-start-3 text-red-600">
      {form.error ? getZodErrorMessage(form.error, ['credit']) : ''}
    </div>
  </section>

  <section id="input-lecture" class="grid grid-cols-6">
    <div class="col-span-2 flex items-center">
      <label for="" class="font-semibold">
        Lecture <span class="text-red-600">*</span>
      </label>
    </div>
    <div class="col-span-4">
      <input
        type="number"
        class="input text-center
        {form.error && getZodErrorMessage(form.error, ['lecture']).length > 0
          ? 'border border-red-600'
          : ''}"
        bind:value="{form.data.lecture}"
        use:blurOnEscape
      />
    </div>
    <div class="col-span-4 col-start-3 text-red-600">
      {form.error ? getZodErrorMessage(form.error, ['lecture']) : ''}
    </div>
  </section>

  <section id="input-lab" class="grid grid-cols-6">
    <div class="col-span-2 flex items-center">
      <label for="" class="font-semibold">
        Lab <span class="text-red-600">*</span>
      </label>
    </div>
    <div class="col-span-4">
      <input
        type="number"
        class="input text-center
        {form.error && getZodErrorMessage(form.error, ['lab']).length > 0
          ? 'border border-red-600'
          : ''}"
        bind:value="{form.data.lab}"
        use:blurOnEscape
      />
    </div>
    <div class="col-span-4 col-start-3 text-red-600">
      {form.error ? getZodErrorMessage(form.error, ['lab']) : ''}
    </div>
  </section>

  <section id="input-learn" class="grid grid-cols-6">
    <div class="col-span-2 flex items-center">
      <label for="" class="font-semibold">
        Learn <span class="text-red-600">*</span>
      </label>
    </div>
    <div class="col-span-4">
      <input
        type="number"
        class="input text-center
        {form.error && getZodErrorMessage(form.error, ['learn']).length > 0
          ? 'border border-red-600'
          : ''}"
        bind:value="{form.data.learn}"
        use:blurOnEscape
      />
    </div>
    <div class="col-span-4 col-start-3 text-red-600">
      {form.error ? getZodErrorMessage(form.error, ['learn']) : ''}
    </div>
  </section>

  <section id="input-exam" class="grid grid-cols-6">
    <div class="col-span-2 flex items-center">
      <label for="" class="font-semibold">
        Exam <span class="text-red-600">*</span>
      </label>
    </div>
    <div class="col-span-4">
      <input
        type="number"
        class="input text-center
        {form.error && getZodErrorMessage(form.error, ['exam']).length > 0
          ? 'border border-red-600'
          : ''}"
        bind:value="{form.data.exam}"
        use:blurOnEscape
      />
    </div>
    <div class="col-span-4 col-start-3 text-red-600">
      {form.error ? getZodErrorMessage(form.error, ['exam']) : ''}
    </div>
  </section>

  <button type="submit" class="button w-full">Save</button>
</form>
