<script lang="ts">
  import { type ZodError, z } from 'zod';
  import { invalidate } from '$app/navigation';
  import { blurOnEscape } from '$lib/utils/directives';
  import { getZodErrorMessage } from '$lib/utils/zod';
  import { createUser, editUser } from '$lib/api/user';
  import { onMount } from 'svelte';
  import Select from '$lib/components/Select.svelte';

  const roleOptions: {
    label: string;
    value: string;
    disabled?: boolean;
  }[] = [
    {
      label: 'User',
      value: 'user',
    },
    {
      label: 'Admin',
      value: 'admin',
    },
  ];

  const schema = z.object({
    id: z.string().nonempty(),
    username: z.string().min(3),
    role: z.string().nonempty({ message: 'Must select one of the options.' }),
  });

  const editSchema = schema
    .extend({
      password: z.string().min(4, 'Password must be longer than 4 characters.').optional(),
      confirmPassword: z.string().min(4, 'Password must be longer than 4 characters.').optional(),
    })
    .superRefine(({ confirmPassword, password }, ctx) => {
      if (confirmPassword !== password) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'The passwords did not match.',
          path: ['confirmPassword'],
        });
      }
    });

  const newSchema = schema
    .omit({
      id: true,
    })
    .extend({
      password: z.string().min(4, 'Password must be longer than 4 characters.'),
      confirmPassword: z.string().min(4, 'Password must be longer than 4 characters.'),
    })
    .superRefine(({ confirmPassword, password }, ctx) => {
      if (confirmPassword !== password) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'The passwords did not match.',
          path: ['confirmPassword'],
        });
      }
    });

  export let edit = false;
  export let editData: typeof form.data = {
    id: '',
    username: '',
    role: '',
  };

  export let callback: () => void = function () {
    // do nothing.
  };

  let form: {
    data: z.infer<typeof editSchema>;
    error: ZodError | undefined;
  } = {
    data: {
      id: '',
      username: '',
      password: '',
      confirmPassword: '',
      role: 'user',
    },
    error: undefined,
  };

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

    const ret = await createUser(result.data).catch((r: Response) => console.error(r));

    if (ret) {
      form.data = {
        id: '',
        username: '',
        password: '',
        role: 'user',
      };

      await invalidate('data:user');

      callback();
    }
  }

  async function handleEdit() {
    form.error = undefined;

    const result = editSchema
      .superRefine((val, ctx) => {
        if (val.password && val.password.length < 4) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'Password must be longer than 4 characters.',
            path: ['password'],
          });
        }
      })
      .transform((val) => ({ ...val, password: val.password == '' ? undefined : val.password }))
      .safeParse(form.data);

    if (!result.success) {
      form.error = result.error;
      return;
    }

    const ret = await editUser(result.data).catch((r: Response) => console.error(r));

    if (ret) {
      form.data = {
        id: '',
        username: '',
        password: '',
        role: 'user',
      };

      await invalidate('data:user');

      callback();
    }
  }

  onMount(() => {
    if (edit && editData) {
      form.data = editData;
    }
  });
</script>

<form on:submit|preventDefault="{() => handleSubmit()}" class="space-y-4">
  <section id="input-role" class="grid grid-cols-6">
    <div class="col-span-2 flex items-center">
      <label for="" class="font-semibold">
        Role <span class="text-red-600">*</span>
      </label>
    </div>
    <div
      class="col-span-4"
      class:invalid="{form.error && getZodErrorMessage(form.error, ['role']).length > 0}"
    >
      <Select options="{roleOptions}" bind:value="{form.data.role}" placeholder="Select Role" />
    </div>
    <div class="col-span-4 col-start-3 text-red-600">
      {form.error ? getZodErrorMessage(form.error, ['role']) : ''}
    </div>
  </section>
  <section id="input-username" class="grid grid-cols-6">
    <div class="col-span-2 flex items-center">
      <label for="" class="font-semibold">
        Username <span class="text-red-600">*</span>
      </label>
    </div>
    <div class="col-span-4">
      <input
        type="text"
        class="input
            {form.error && getZodErrorMessage(form.error, ['username']).length > 0
          ? 'border border-red-600'
          : ''}"
        bind:value="{form.data.username}"
        use:blurOnEscape
      />
    </div>
    <div class="col-span-4 col-start-3 text-red-600">
      {form.error ? getZodErrorMessage(form.error, ['username']) : ''}
    </div>
  </section>

  <section id="input-password" class="grid grid-cols-6">
    <div class="col-span-2 flex items-center">
      <label for="" class="font-semibold">
        Password {#if !edit}<span class="text-red-600">*</span>{/if}
      </label>
    </div>
    <div class="col-span-4">
      <input
        type="password"
        class="input
            {form.error && getZodErrorMessage(form.error, ['password']).length > 0
          ? 'border border-red-600'
          : ''}"
        bind:value="{form.data.password}"
        use:blurOnEscape
      />
    </div>
    <div class="col-span-4 col-start-3 text-red-600">
      {form.error ? getZodErrorMessage(form.error, ['password']) : ''}
    </div>
  </section>

  <section id="input-confirm-password" class="grid grid-cols-6">
    <div class="col-span-2 flex items-center">
      <label for="confirm-password" class="font-semibold">
        Confirm Password {#if !edit}<span class="text-red-600">*</span>{/if}
      </label>
    </div>
    <div class="col-span-4">
      <input
        type="password"
        class="input
            {form.error && getZodErrorMessage(form.error, ['confirmPassword']).length > 0
          ? 'border border-red-600'
          : ''}"
        bind:value="{form.data.confirmPassword}"
        use:blurOnEscape
      />
    </div>
    <div class="col-span-4 col-start-3 text-red-600">
      {form.error ? getZodErrorMessage(form.error, ['confirmPassword']) : ''}
    </div>
  </section>

  <button type="submit" class="button w-full">Save</button>
</form>
