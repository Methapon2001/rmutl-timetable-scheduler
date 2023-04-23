<script lang="ts">
  import { type ZodError, z } from 'zod';
  import { invalidate } from '$app/navigation';
  import { blurOnEscape } from '$lib/utils/directives';
  import { getZodErrorMessage } from '$lib/utils/zod';
  import { editSection } from '$lib/api/section';
  import { onMount, tick } from 'svelte';
  import Select from '$lib/components/Select.svelte';

  const schema = z.object({
    id: z.string(),
    groupId: z.string(),
    roomId: z.string(),
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
    detail: API.Room;
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
    data: z.infer<typeof schema>;
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

  let selected: {
    groupId: string[];
    roomId: string[];
  } = {
    groupId: edit && editData && editData.groupId != '' ? [editData.groupId] : [],
    roomId: edit && editData && editData.roomId != '' ? [editData.roomId] : [],
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

      selected = {
        groupId: [],
        roomId: [],
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
      <Select
        options={groupOptions}
        bind:value={form.data.groupId}
        bind:selected={selected.groupId}
      />
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
      <Select options={roomOptions} bind:value={form.data.roomId} bind:selected={selected.roomId} />
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
      <Select options={instructorOptions} bind:selected={form.data.instructor} multiple />
    </div>
    <div class="col-span-4 col-start-3 text-red-600">
      {form.error ? getZodErrorMessage(form.error, ['instructor']) : ''}
    </div>
  </section>

  <button type="submit" class="button w-full">Save</button>
</form>
