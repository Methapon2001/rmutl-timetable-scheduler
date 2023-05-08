<script lang="ts">
  import { type ZodError, z } from 'zod';
  import { invalidate } from '$app/navigation';
  import { blurOnEscape } from '$lib/utils/directives';
  import { getZodErrorMessage } from '$lib/utils/zod';
  import { createExam, editExam } from '$lib/api/exam';
  import { onMount } from 'svelte';
  import Select from '$lib/components/Select.svelte';
  import toast from 'svelte-french-toast';

  const schema = z.object({
    id: z.string().nonempty(),
    roomId: z.string(),
    section: z.string().array(),
    instructor: z.string().array(),
  });

  const newSchema = schema.omit({
    id: true,
  });

  export let sectionOptions: {
    label: string;
    value: string;
    disabled?: boolean;
    detail: API.Section; // eslint-disale-line no-undef
  }[];

  export let instructorOptions: {
    label: string;
    value: string;
    disabled?: boolean;
  }[];

  export let roomOptions: {
    label: string;
    value: string;
    disabled?: boolean;
  }[];

  export let edit = false;
  export let editData: typeof form.data = {
    id: '',
    section: [],
    instructor: [],
    roomId: '',
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
      section: [],
      instructor: [],
      roomId: '',
    },
    error: undefined,
  };

  let firstInput: HTMLInputElement;

  async function handleSubmit() {
    return edit ? await handleEdit() : await handleCreate();
  }

  async function handleCreate() {
    form.error = undefined;

    const result = newSchema
      .transform((val) => ({
        ...val,
        section: val.section.map((sec) => ({ id: sec })),
        instructor: val.instructor.map((inst) => ({ id: inst })),
      }))
      .safeParse(form.data);

    if (!result.success) {
      form.error = result.error;
      return;
    }

    result.data;

    const ret = await createExam(result.data).catch((r: Response) => console.error(r));

    if (ret) {
      form.data = {
        id: '',
        section: [],
        instructor: [],
        roomId: '',
      };

      await invalidate('data:exam');

      callback();

      firstInput.focus();

      toast.success('Exam Created!');
    } else {
      toast.error('Fail to create Exam!');
    }
  }

  async function handleEdit() {
    form.error = undefined;

    const result = schema
      .transform((val) => ({
        ...val,
        section: val.section.map((sec) => ({ id: sec })),
        instructor: val.instructor.map((inst) => ({ id: inst })),
      }))
      .safeParse(form.data);

    if (!result.success) {
      form.error = result.error;
      return;
    }

    const ret = await editExam(result.data).catch((r: Response) => console.error(r));

    if (ret) {
      form.data = {
        id: '',
        section: [],
        instructor: [],
        roomId: '',
      };

      await invalidate('data:exam');

      callback();

      toast.success('Edit Complete!');
    } else {
      toast.error('Fail to Edit exam!');
    }
  }

  onMount(() => {
    if (edit && editData) {
      form.data = editData;
    }
    console.log(instructorOptions);
    console.log(form.data.instructor);
  });
</script>

<form on:submit|preventDefault="{() => handleSubmit()}" class="space-y-4">
  <section id="input-section" class="grid grid-cols-6">
    <div class="col-span-2 flex items-center">
      <label for="" class="font-semibold">
        Section <span class="text-red-600">*</span>
      </label>
    </div>
    <div
      class="col-span-4"
      class:invalid="{form.error && getZodErrorMessage(form.error, ['section']).length > 0}"
    >
      <Select
        options="{sectionOptions.filter((option) => {
          if (form.data.section.length !== 0) {
            return (
              sectionOptions.find((opt) => form.data.section[0] == opt.detail.id)?.detail.subject
                .name == option.detail.subject.name
            );
          }

          return true;
        })}"
        bind:value="{form.data.section}"
        multiple
        placeholder="Select Section"
      />
    </div>
    <div class="col-span-4 col-start-3 text-red-600">
      {form.error ? getZodErrorMessage(form.error, ['section']) : ''}
    </div>
  </section>

  <section id="input-instructor" class="grid grid-cols-6">
    <div class="col-span-2 flex items-center">
      <label for="" class="font-semibold">
        Instructor <span class="text-red-600">*</span>
      </label>
    </div>
    <div
      class="col-span-4"
      class:invalid="{form.error && getZodErrorMessage(form.error, ['instructor']).length > 0}"
    >
      <Select
        options="{instructorOptions}"
        bind:value="{form.data.instructor}"
        multiple
        placeholder="Select instructor"
      />
    </div>
    <div class="col-span-4 col-start-3 text-red-600">
      {form.error ? getZodErrorMessage(form.error, ['instructor']) : ''}
    </div>
  </section>

  <section id="input-room" class="grid grid-cols-6">
    <div class="col-span-2 flex items-center">
      <label for="" class="font-semibold">
        Room <span class="text-red-600">*</span>
      </label>
    </div>
    <div
      class="col-span-4"
      class:invalid="{form.error && getZodErrorMessage(form.error, ['roomId']).length > 0}"
    >
      <Select options="{roomOptions}" bind:value="{form.data.roomId}" placeholder="Select room" />
    </div>
    <div class="col-span-4 col-start-3 text-red-600">
      {form.error ? getZodErrorMessage(form.error, ['roomId']) : ''}
    </div>
  </section>

  <button type="submit" class="button w-full">Save</button>
</form>
