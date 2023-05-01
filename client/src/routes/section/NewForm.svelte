<script lang="ts">
  import { type ZodError, z } from 'zod';
  import { invalidate } from '$app/navigation';
  import { getZodErrorMessage } from '$lib/utils/zod';
  import { createSection } from '$lib/api/section';
  import { tick } from 'svelte';
  import Select from '$lib/components/Select.svelte';
  import CrossIcon from '$lib/icons/CrossIcon.svelte';
  import toast from 'svelte-french-toast';

  const schema = z.object({
    type: z.string(),
    subjectId: z.string().nonempty('Must select one of the options.'),
    groupId: z.string().transform((v) => v.trim() || null),
    manual: z.boolean(),
    no: z.number().nullable(),
    alt: z.string().transform((v) => {
      if (!v.trim()) return null;

      const listNo = v.split(/[,\s]+/).map(Number);
      const sortedNo = [...new Set(listNo)].sort((a, b) => +a - +b);
      return sortedNo.join(', ');
    }),
    section: z
      .object({
        roomId: z.string().transform((v) => v.trim() || null),
        instructor: z.string().array(),
      })
      .array(),
  });

  export let groupOptions: {
    label: string;
    value: string;
    disabled?: boolean;
  }[];

  export let roomOptions: {
    label: string;
    value: string;
    disabled?: boolean;
    detail: API.Room; // eslint-disable-line no-undef
  }[];

  export let subjectOptions: {
    label: string;
    value: string;
    disabled?: boolean;
    detail: API.Subject; // eslint-disable-line no-undef
  }[];

  export let instructorOptions: {
    label: string;
    value: string;
    disabled?: boolean;
  }[];

  export let callback: () => void = function () {
    // do nothing.
  };

  let form: {
    data: z.input<typeof schema>;
    error: ZodError | undefined;
  } = {
    data: {
      type: '',
      subjectId: '',
      groupId: '',
      manual: false,
      no: null,
      alt: '',
      section: [],
    },
    error: undefined,
  };

  function addSection() {
    form.data.section = [
      ...form.data.section,
      {
        roomId: '',
        instructor: [],
      },
    ];
  }

  function removeSection(index: number) {
    if (form.data.section.length == 1) return;

    form.data.section = form.data.section.filter((_, idx) => idx != index);
  }

  async function handleChange() {
    await tick();

    const subject = subjectOptions.find((opt) => form.data.subjectId == opt.value)?.detail;

    if (subject && subject.lecture == 0) {
      form.data.type = 'lab';
    } else {
      form.data.type = 'lecture';
    }

    form.data.section = [
      {
        roomId: '',
        instructor: [],
      },
    ];

    if (subject && subject.lecture > 0 && subject.lab > 0) {
      form.data.section = [
        ...form.data.section,
        {
          roomId: '',
          instructor: [],
        },
      ];
    }
  }

  async function handleSubmit() {
    form.error = undefined;

    const result = schema
      .transform((val) => {
        return {
          ...val,
          no: val.no ?? undefined,
          groupId: val.groupId === '' ? null : val.groupId,
          section: val.section.map((sec) => {
            return {
              roomId: sec.roomId === '' ? null : sec.roomId,
              instructor: sec.instructor.map((inst) => ({ id: inst })),
            };
          }),
        };
      })
      .safeParse(form.data);

    if (!result.success) {
      form.error = result.error;
      return;
    }

    const ret = await createSection(result.data).catch((r: Response) => console.error(r.json()));

    if (ret) {
      form.data = {
        alt: '',
        type: '',
        subjectId: '',
        groupId: '',
        manual: false,
        no: null,
        section: [],
      };

      await invalidate('data:section');

      callback();

      toast.success('Section Created!');
    } else {
      toast.error('Fail to create Section!');
    }
  }
</script>

<form on:submit|preventDefault="{() => handleSubmit()}" class="space-y-4">
  <section id="input-manual" class="grid grid-cols-6">
    <div class="col-span-2 flex items-center">
      <label for="" class="font-semibold">
        Section No. <span class="text-red-600">*</span>
      </label>
    </div>
    <div class="col-span-4">
      <div>
        <label><input type="radio" bind:group="{form.data.manual}" value="{false}" /> Auto</label>
      </div>
      <div class="flex items-center gap-4">
        <label class="whitespace-nowrap">
          <input type="radio" bind:group="{form.data.manual}" value="{true}" /> Manual
        </label>
        <input
          type="number"
          class="input w-fit text-center"
          bind:value="{form.data.no}"
          disabled="{!form.data.manual}"
        />
      </div>
    </div>
  </section>
  <section id="input-alt" class="grid grid-cols-6">
    <div class="col-span-2 flex items-center">
      <label for="" class="font-semibold">
        Alternate Section No. <span class="text-red-600">*</span>
      </label>
    </div>
    <div class="col-span-4">
      <input
        type="text"
        class="input
          {form.error && getZodErrorMessage(form.error, ['alt']).length > 0
          ? 'border border-red-600'
          : ''}"
        bind:value="{form.data.alt}"
      />
    </div>
    <div class="col-span-4 col-start-3 text-red-600">
      {form.error ? getZodErrorMessage(form.error, ['alt']) : ''}
    </div>
  </section>
  <section id="input-group" class="grid grid-cols-6">
    <div class="col-span-2 flex items-center">
      <label for="group" class="font-semibold">
        Group <span class="text-red-600">*</span>
      </label>
    </div>
    <div
      class="col-span-4"
      class:invalid="{form.error && getZodErrorMessage(form.error, ['groupId']).length > 0}"
    >
      <Select options="{groupOptions}" bind:value="{form.data.groupId}" />
    </div>
    <div class="col-span-4 col-start-3 text-red-600">
      {form.error ? getZodErrorMessage(form.error, ['groupId']) : ''}
    </div>
  </section>
  <section id="input-subject" class="grid grid-cols-6">
    <div class="col-span-2 flex items-center">
      <label for="subject" class="font-semibold">
        Subject <span class="text-red-600">*</span>
      </label>
    </div>
    <div
      class="col-span-4"
      class:invalid="{form.error && getZodErrorMessage(form.error, ['subjectId']).length > 0}"
    >
      <Select
        options="{subjectOptions}"
        bind:value="{form.data.subjectId}"
        on:change="{() => handleChange()}"
      />
    </div>
    <div class="col-span-4 col-start-3 text-red-600">
      {form.error ? getZodErrorMessage(form.error, ['subjectId']) : ''}
    </div>
  </section>
  {#if form.data.subjectId != ''}
    {#each form.data.section as _, sectionIdx}
      <div class="relative space-y-4 rounded border p-3">
        <button
          type="button"
          class="absolute right-0 top-0 p-3"
          on:click="{() => removeSection(sectionIdx)}"
        >
          <CrossIcon />
        </button>
        <h2 class="font-2xl text-center font-semibold capitalize">
          Section {sectionIdx + 1} ({sectionIdx == 0 ? form.data.type : 'lab'})
        </h2>
        <section id="input-room" class="grid grid-cols-6">
          <div class="col-span-2 flex items-center">
            <label for="room" class="font-semibold">
              Room <span class="text-red-600">*</span>
            </label>
          </div>
          <div
            class="col-span-4"
            class:invalid="{form.error &&
              getZodErrorMessage(form.error, ['section', sectionIdx, 'roomId']).length > 0}"
          >
            <Select
              options="{roomOptions.filter(
                (opt) =>
                  opt.detail.type == 'both' ||
                  (sectionIdx == 0 && form.data.type == opt.detail.type) ||
                  (sectionIdx != 0 && opt.detail.type == 'lab'),
              )}"
              bind:value="{form.data.section[sectionIdx].roomId}"
            />
          </div>
          <div class="col-span-4 col-start-3 text-red-600">
            {form.error ? getZodErrorMessage(form.error, ['section', sectionIdx, 'roomId']) : ''}
          </div>
        </section>
        <section id="input-instructor" class="grid grid-cols-6">
          <div class="col-span-2 flex items-center">
            <label for="instructor" class="font-semibold">
              Instructor <span class="text-red-600">*</span>
            </label>
          </div>
          <div
            class="col-span-4"
            class:invalid="{form.error &&
              getZodErrorMessage(form.error, ['section', sectionIdx, 'instructor']).length > 0}"
          >
            <Select
              options="{instructorOptions}"
              bind:value="{form.data.section[sectionIdx].instructor}"
              multiple
            />
          </div>
          <div class="col-span-4 col-start-3 text-red-600">
            {form.error
              ? getZodErrorMessage(form.error, ['section', sectionIdx, 'instructorId'])
              : ''}
          </div>
        </section>
      </div>
    {/each}
    <button type="button" class="button w-full" on:click="{() => addSection()}">Add section</button>
  {/if}
  <button type="submit" class="button w-full">Save</button>
</form>
