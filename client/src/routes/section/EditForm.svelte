<script lang="ts">
  import { type ZodError, z } from 'zod';
  import { invalidate } from '$app/navigation';
  import { getZodErrorMessage } from '$lib/utils/zod';
  import { editSection } from '$lib/api/section';
  import { onMount } from 'svelte';
  import Select from '$lib/components/Select.svelte';

  const schema = z.object({
    id: z.string(),
    groupId: z.string().transform((v) => v.trim() || null),
    roomId: z.string().transform((v) => v.trim() || null),
    instructor: z.string().array(),
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
      id: '',
      groupId: '',
      roomId: '',
      instructor: [],
    },
    error: undefined,
  };

  export let edit = false;
  export let editData: typeof form.data = {
    id: '',
    groupId: '',
    roomId: '',
    instructor: [],
  };

  export let showData: {
    no: number;
    type: string;
    lab: number | null;
    subject: { name: string };
  };

  async function handleSubmit() {
    form.error = undefined;

    const result = schema
      .transform((val) => {
        return {
          ...val,
          instructor: val.instructor.map((inst) => ({ id: inst })),
        };
      })
      .safeParse(form.data);

    if (!result.success) {
      form.error = result.error;
      return;
    }

    const ret = await editSection(result.data).catch((r: Response) => console.error(r));

    if (ret) {
      form.data = {
        id: '',
        groupId: '',
        roomId: '',
        instructor: [],
      };

      await invalidate('data:section');

      callback();
    }
  }

  onMount(() => {
    if (edit && editData) {
      form.data = editData;
    }
  });
</script>

<form on:submit|preventDefault={() => handleSubmit()} class="space-y-4">
  <h1 class="text-xl font-bold">
    {showData.subject.name} Sec {showData.no}
    <span class="capitalize">({showData.type}{showData.lab ?? ''})</span>
  </h1>
  <section id="input-group" class="grid grid-cols-6">
    <div class="col-span-2 flex items-center">
      <label for="group" class="font-semibold">
        Group <span class="text-red-600">*</span>
      </label>
    </div>
    <div
      class="col-span-4"
      class:invalid={form.error && getZodErrorMessage(form.error, ['groupId']).length > 0}
    >
      <Select options={groupOptions} bind:value={form.data.groupId} />
    </div>
    <div class="col-span-4 col-start-3 text-red-600">
      {form.error ? getZodErrorMessage(form.error, ['groupId']) : ''}
    </div>
  </section>
  <section id="input-room" class="grid grid-cols-6">
    <div class="col-span-2 flex items-center">
      <label for="room" class="font-semibold">
        Room <span class="text-red-600">*</span>
      </label>
    </div>
    <div
      class="col-span-4"
      class:invalid={form.error && getZodErrorMessage(form.error, ['roomId']).length > 0}
    >
      <Select
        options={roomOptions.filter(
          (opt) => opt.detail.type == 'both' || showData.type == opt.detail.type,
        )}
        bind:value={form.data.roomId}
      />
    </div>
    <div class="col-span-4 col-start-3 text-red-600">
      {form.error ? getZodErrorMessage(form.error, ['roomId']) : ''}
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
      class:invalid={form.error && getZodErrorMessage(form.error, ['instructor']).length > 0}
    >
      <Select options={instructorOptions} bind:value={form.data.instructor} multiple />
    </div>
    <div class="col-span-4 col-start-3 text-red-600">
      {form.error ? getZodErrorMessage(form.error, ['instructor']) : ''}
    </div>
  </section>

  <button type="submit" class="button w-full">Save</button>
</form>
