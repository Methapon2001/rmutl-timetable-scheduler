<script lang="ts">
  import { type ZodError, z } from 'zod';
  import { invalidate } from '$app/navigation';
  import { blurOnEscape } from '$lib/utils/directives';
  import { getZodErrorMessage } from '$lib/utils/zod';
  import { createPlan, editPlan } from '$lib/api/plan';
  import { onMount } from 'svelte';
  import Select from '$lib/components/Select.svelte';
  import toast from 'svelte-french-toast';

  const schema = z.object({
    id: z.string().nonempty(),
    name: z.string().min(3),
    detail: z
      .object({
        year: z.number().min(1).max(8),
        semester: z.number().min(1).max(3),
        subjectId: z.string().array(),
      })
      .array(),
    courseId: z.string(),
  });

  const newSchema = schema.omit({
    id: true,
  });

  export let courseOptions: {
    label: string;
    value: string;
    disabled?: boolean;
    detail: API.Course; // eslint-disable-line no-undef
  }[];

  export let subjectOptions: {
    label: string;
    value: string;
    disabled?: boolean;
  }[];

  export let edit = false;
  export let editData: typeof form.data = {
    id: '',
    name: '',
    detail: [
      {
        year: 1,
        semester: 1,
        subjectId: [],
      },
    ],
    courseId: '',
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
      name: '',
      detail: [
        {
          year: 1,
          semester: 1,
          subjectId: [],
        },
      ],
      courseId: '',
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
        name: val.name,
        courseId: val.courseId,
        detail: val.detail.flatMap((val) =>
          val.subjectId.map((subjectId) => ({ year: val.year, semester: val.semester, subjectId })),
        ),
      }))
      .safeParse(form.data);

    if (!result.success) {
      form.error = result.error;
      return;
    }

    const ret = await createPlan(result.data).catch((r: Response) => console.error(r));

    if (ret) {
      form.data = {
        id: '',
        name: '',
        detail: [
          {
            year: 1,
            semester: 1,
            subjectId: [],
          },
        ],
        courseId: '',
      };

      await invalidate('data:plan');

      callback();

      firstInput.focus();

      toast.success('Plan Created!');
    } else {
      toast.error('Fail to create Plan!');
    }
  }

  async function handleEdit() {
    form.error = undefined;

    const result = schema
      .transform((val) => ({
        id: val.id,
        name: val.name,
        courseId: val.courseId,
        detail: val.detail.flatMap((val) =>
          val.subjectId.map((subjectId) => ({ year: val.year, semester: val.semester, subjectId })),
        ),
      }))
      .safeParse(form.data);

    if (!result.success) {
      form.error = result.error;
      return;
    }

    const ret = await editPlan(result.data).catch((r: Response) => console.error(r));

    if (ret) {
      form.data = {
        id: '',
        name: '',
        detail: [
          {
            year: 1,
            semester: 1,
            subjectId: [],
          },
        ],
        courseId: '',
      };

      await invalidate('data:plan');

      callback();

      toast.success('Edit Complete!');
    } else {
      toast.error('Fail to Edit plan!');
    }
  }

  onMount(() => {
    if (edit && editData) {
      form.data = editData;
    }
  });

  function addDetail() {
    const last = form.data.detail.at(-1);

    if (last?.year === 8 && last?.semester === 3) return;

    if (!last) {
      form.data.detail = [
        {
          year: 1,
          semester: 1,
          subjectId: [],
        },
      ];
    } else {
      form.data.detail =
        last.semester < 3
          ? [
              ...form.data.detail,
              {
                year: last.year,
                semester: last.semester + 1,
                subjectId: [],
              },
            ]
          : [
              ...form.data.detail,
              {
                year: last.year + 1,
                semester: 1,
                subjectId: [],
              },
            ];
    }
  }
</script>

<form on:submit|preventDefault="{() => handleSubmit()}" class="space-y-4">
  <section id="input-name" class="grid grid-cols-6">
    <div class="col-span-2 flex items-center">
      <label for="" class="font-semibold">
        Name <span class="text-red-600">*</span>
      </label>
    </div>
    <div class="col-span-4">
      <input
        type="text"
        class="input
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
  <section id="input-course" class="grid grid-cols-6">
    <div class="col-span-2 flex items-center">
      <label for="" class="font-semibold">
        Course <span class="text-red-600">*</span>
      </label>
    </div>
    <div
      class="col-span-4"
      class:invalid="{form.error && getZodErrorMessage(form.error, ['courseId']).length > 0}"
    >
      <Select
        options="{courseOptions}"
        bind:value="{form.data.courseId}"
        placeholder="Select Course"
      />
    </div>
    <div class="col-span-4 col-start-3 text-red-600">
      {form.error ? getZodErrorMessage(form.error, ['courseId']) : ''}
    </div>
  </section>
  {#if form.data.courseId}
    {#each form.data.detail as _, detailIdx}
      <div class="space-y-2 rounded border p-4">
        <section id="input-year" class="grid grid-cols-6">
          <div class="col-span-2 flex items-center">
            <label for="" class="font-semibold">
              Year <span class="text-red-600">*</span>
            </label>
          </div>
          <div class="col-span-4">
            <input
              type="number"
              class="input
              {form.error && getZodErrorMessage(form.error, ['year']).length > 0
                ? 'border border-red-600'
                : ''}"
              bind:value="{form.data.detail[detailIdx].year}"
              use:blurOnEscape
              max="8"
              min="1"
            />
          </div>
          <div class="col-span-4 col-start-3 text-red-600">
            {form.error ? getZodErrorMessage(form.error, ['year']) : ''}
          </div>
        </section>
        <section id="input-semester" class="grid grid-cols-6">
          <div class="col-span-2 flex items-center">
            <label for="" class="font-semibold">
              Semester <span class="text-red-600">*</span>
            </label>
          </div>
          <div class="col-span-4">
            <input
              type="number"
              class="input
              {form.error && getZodErrorMessage(form.error, ['semester']).length > 0
                ? 'border border-red-600'
                : ''}"
              bind:value="{form.data.detail[detailIdx].semester}"
              use:blurOnEscape
              max="3"
              min="1"
            />
          </div>
          <div class="col-span-4 col-start-3 text-red-600">
            {form.error ? getZodErrorMessage(form.error, ['semester']) : ''}
          </div>
        </section>
        <section id="input-subject" class="grid grid-cols-6">
          <div class="col-span-2 flex items-center">
            <label for="" class="font-semibold">
              Subject <span class="text-red-600">*</span>
            </label>
          </div>
          <div
            class="col-span-4"
            class:invalid="{form.error && getZodErrorMessage(form.error, ['subjectId']).length > 0}"
          >
            <Select
              options="{subjectOptions.filter((option) => {
                const used = form.data.detail.some(
                  (d, idx) =>
                    idx !== detailIdx && d.subjectId.findIndex((v) => v === option.value) !== -1,
                );

                if (form.data.courseId.length !== 0) {
                  const val = courseOptions.find((opt) => opt.value === form.data.courseId);
                  const course = val?.detail;

                  return !used && course?.detail.some((d) => d.subject.id === option.value);
                }
              })}"
              bind:value="{form.data.detail[detailIdx].subjectId}"
              multiple
              placeholder="Select Subject"
            />
          </div>
          <div class="col-span-4 col-start-3 text-red-600">
            {form.error ? getZodErrorMessage(form.error, ['subjectId']) : ''}
          </div>
        </section>
      </div>
    {/each}
    <button type="button" class="button w-full" on:click="{() => addDetail()}">Add semester</button>
  {/if}
  <button type="submit" class="button w-full">Save</button>
  <!--  <section id="input-course" class="grid grid-cols-6">
    <div class="col-span-2 flex items-center">
      <label for="" class="font-semibold">
        Course <span class="text-red-600">*</span>
      </label>
    </div>
    <div
      class="col-span-4"
      class:invalid="{form.error && getZodErrorMessage(form.error, ['courseId']).length > 0}"
    >
      <Select
        options="{courseOptions}"
        bind:value="{form.data.courseId}"
        placeholder="Select Course"
      />
    </div>
    <div class="col-span-4 col-start-3 text-red-600">
      {form.error ? getZodErrorMessage(form.error, ['courseId']) : ''}
    </div>
  </section>
  <section id="input-subject" class="grid grid-cols-6">
    <div class="col-span-2 flex items-center">
      <label for="" class="font-semibold">
        Subject <span class="text-red-600">*</span>
      </label>
    </div>
    <div
      class="col-span-4"
      class:invalid="{form.error && getZodErrorMessage(form.error, ['subjectId']).length > 0}"
    >
      <Select
        options="{subjectOptions.filter((option) => {
          if (form.data.courseId.length !== 0) {
            const val = courseOptions.find((opt) => opt.value === form.data.courseId);
            const course = val?.detail;

            return course?.detail.some((detail) => detail.subject.id === option.value);
          }
        })}"
        bind:value="{form.data.subjectId}"
        multiple
        placeholder="Select Subject"
      />
    </div>
    <div class="col-span-4 col-start-3 text-red-600">
      {form.error ? getZodErrorMessage(form.error, ['subjectId']) : ''}
    </div>
  </section>
  <section id="input-year" class="grid grid-cols-6">
    <div class="col-span-2 flex items-center">
      <label for="" class="font-semibold">
        Year <span class="text-red-600">*</span>
      </label>
    </div>
    <div class="col-span-4">
      <input
        type="number"
        class="input
          {form.error && getZodErrorMessage(form.error, ['year']).length > 0
          ? 'border border-red-600'
          : ''}"
        bind:value="{form.data.year}"
        bind:this="{firstInput}"
        use:blurOnEscape
      />
    </div>
    <div class="col-span-4 col-start-3 text-red-600">
      {form.error ? getZodErrorMessage(form.error, ['year']) : ''}
    </div>
  </section>
  <section id="input-semester" class="grid grid-cols-6">
    <div class="col-span-2 flex items-center">
      <label for="" class="font-semibold">
        Semester <span class="text-red-600">*</span>
      </label>
    </div>
    <div class="col-span-4">
      <input
        type="number"
        class="input
          {form.error && getZodErrorMessage(form.error, ['semester']).length > 0
          ? 'border border-red-600'
          : ''}"
        bind:value="{form.data.semester}"
        use:blurOnEscape
      />
    </div>
    <div class="col-span-4 col-start-3 text-red-600">
      {form.error ? getZodErrorMessage(form.error, ['semester']) : ''}
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
        class="input
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

  <button type="submit" class="button w-full">Save</button> -->
</form>
