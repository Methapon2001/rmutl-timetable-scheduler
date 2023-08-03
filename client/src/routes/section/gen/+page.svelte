<script lang="ts">
  import type { PageData } from './$types';
  import { type ZodError, z } from 'zod';
  import Select from '$lib/components/Select.svelte';
  import { createSection } from '$lib/api/section';
  import toast from 'svelte-french-toast';
  import CrossIcon from '$lib/icons/CrossIcon.svelte';

  export let data: PageData;

  const sectionSchema = z
    .object({
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
          capacity: z.number(),
        })
        .array(),
    })
    .transform((val) => {
      return {
        ...val,
        no: val.no ?? undefined,
        groupId: val.groupId === '' ? null : val.groupId,
        section: val.section.map((sec) => {
          return {
            roomId: sec.roomId === '' ? null : sec.roomId,
            instructor: sec.instructor.map((inst) => ({ id: inst })),
            capacity: sec.capacity,
          };
        }),
      };
    })
    .array();

  let selectedSemesterState = '1';
  let selectedGroupState: string[] = [];
  let selectedGroupDetailState: {
    year: string;
    groupId: string;
    subjectId: string[];
  }[] = [];

  let sectionState: {
    year: string;
    groupId: string;
    subjectId: string[];
    subjectSection: z.input<typeof sectionSchema>;
    error: ZodError | undefined;
  }[] = [];

  let instructorOptions = data.instructor.data.map((inst) => ({
    label: inst.name,
    value: inst.id,
  }));

  let roomOptions = data.room.data.map((room) => ({
    label: `${room.building.code}-${room.name} (${room.type})`,
    value: room.id,
  }));

  // eslint-disable-next-line no-undef
  let groupMap = data.group.data.reduce<{ [id: string]: API.Group }>((acc, curr) => {
    acc[curr.id] = curr;
    return acc;
  }, {});

  let subjectMap = data.group.data.reduce<{
    [id: string]: API.Group['plan']['detail'][number]['subject']; //eslint-disable-line no-undef
  }>((acc, curr) => {
    curr.plan.detail.forEach((v) => {
      acc[v.subject.id] = v.subject;
    });
    return acc;
  }, {});

  function validateError() {
    let ret: z.infer<typeof sectionSchema>[] = [];
    sectionState.forEach((section, sectionIdx) => {
      sectionState[sectionIdx].error = undefined;

      const result = sectionSchema.safeParse(section.subjectSection);

      if (!result.success) {
        sectionState[sectionIdx].error = result.error;
        return;
      }

      ret.push(result.data);
    });

    if (sectionState.every((section) => section.error === undefined)) {
      return ret.flat();
    } else {
      return false;
    }
  }

  async function handleSubmit() {
    let data = validateError();

    if (data) {
      const result = await Promise.all(data.map((d) => createSection(d))).catch((e) =>
        console.error(e),
      );

      console.log(result);
      toast.success('Section Created!');
      selectedSemesterState = '1';
      selectedGroupState = [];
      selectedGroupDetailState = [];
    } else {
      toast.error('Fail to create Section!');
    }
  }

  $: sectionState = selectedGroupDetailState.map((current) => {
    const prevState = sectionState.find((item) => {
      return item.groupId === current.groupId;
    });

    const ret = {
      ...current,
      subjectSection: current.subjectId.map((subjectId) => {
        const sectionPrevState = prevState?.subjectSection.find(
          (item) => item.subjectId === subjectId,
        );

        if (sectionPrevState) return sectionPrevState;

        let sec = {
          subjectId,
          no: null,
          alt: '',
          type: subjectMap[subjectId].lecture > 0 ? 'lecture' : 'lab',
          manual: false,
          groupId: current.groupId,
          section: [
            {
              roomId: '',
              instructor: [],
              capacity: 0,
            },
          ],
        };

        if (subjectMap[subjectId].lecture > 0 && subjectMap[subjectId].lab > 0) {
          sec.section.push({
            roomId: '',
            instructor: [],
            capacity: 0,
          });
        }

        return sec;
      }),
      error: undefined,
    };

    return ret;
  });

  function addSection(stateIdx: number, subjectSectionIdx: number) {
    sectionState[stateIdx].subjectSection[subjectSectionIdx].section = [
      ...sectionState[stateIdx].subjectSection[subjectSectionIdx].section,
      {
        roomId: '',
        instructor: [],
        capacity: 0,
      },
    ];
  }

  function removeSection(stateIdx: number, subjectSectionIdx: number, sectionIdx: number) {
    const stateData = sectionState[stateIdx].subjectSection[subjectSectionIdx];
    const stateDataLength = sectionState[stateIdx].subjectSection[subjectSectionIdx].section.length;

    if (stateDataLength === 1) {
      toast.error('Cannot remove minimum requirement.');
      return;
    }

    const subject = subjectMap[stateData.subjectId];

    if (subject && subject.lecture !== 0 && stateDataLength === 1) {
      toast.error('Cannot remove minimum requirement.');
      return;
    }
    if (subject && subject.lab !== 0 && subject.lecture === 0 && stateDataLength === 1) {
      toast.error('Cannot remove minimum requirement.');
      return;
    }
    if (subject && subject.lab !== 0 && subject.lecture !== 0 && stateDataLength === 2) {
      toast.error('Cannot remove minimum requirement.');
      return;
    }

    sectionState[stateIdx].subjectSection[subjectSectionIdx].section = sectionState[
      stateIdx
    ].subjectSection[subjectSectionIdx].section.filter((_, idx) => idx !== sectionIdx);
  }
</script>

<svelte:head>
  <title>Generate Section</title>
</svelte:head>

<div class="space-y-4 p-4">
  <h1 class="mb-4 text-center text-2xl font-bold">Generate Section</h1>
  <article class="mx-auto gap-2 space-y-4 rounded border bg-white p-4">
    <section id="input-semester" class="grid grid-cols-6">
      <div class="col-span-2 flex items-center">
        <label for="semester" class="font-semibold">
          Semester <span class="text-red-600">*</span>
        </label>
      </div>
      <div class="col-span-4">
        <Select
          options="{['1', '2', '3']}"
          bind:value="{selectedSemesterState}"
          placeholder="Select Course"
        />
      </div>
    </section>
    <section id="input-group" class="grid grid-cols-6">
      <div class="col-span-2 flex items-center">
        <label for="group" class="font-semibold">
          Group <span class="text-red-600">*</span>
        </label>
      </div>
      <div class="col-span-4 grid auto-cols-fr">
        {#each data.group.data as group}
          <label class="whitespace-nowrap px-4 font-semibold">
            <input
              type="checkbox"
              value="{group.id}"
              bind:group="{selectedGroupState}"
              on:change="{() => {
                selectedGroupDetailState = selectedGroupState.map((curr) => {
                  const exist = selectedGroupDetailState.find((detail) => detail.groupId === curr);

                  if (exist) return exist;

                  return {
                    year: '1',
                    groupId: curr,
                    subjectId: [],
                  };
                });
              }}"
            />
            {group.name}
          </label>
        {/each}
      </div>
    </section>
  </article>

  {#if selectedGroupDetailState.length !== 0}
    <article class="mx-auto gap-2 space-y-4 rounded border bg-white p-4">
      {#each selectedGroupDetailState as detail, detailIdx}
        {@const subjectOptions = groupMap[detail.groupId].plan.detail
          .filter(
            (v) =>
              v.semester.toString() === selectedSemesterState && v.year.toString() === detail.year,
          )
          .map((v) => ({
            label: `${v.subject.code} ${v.subject.name}`,
            value: v.subject.id,
          }))}

        <h1 class="text-center text-2xl font-semibold">{groupMap[detail.groupId].name}</h1>

        <hr />
        <section id="input-year" class="grid grid-cols-6">
          <div class="col-span-2 flex items-center">
            <label for="year" class="font-semibold">
              Year <span class="text-red-600">*</span>
            </label>
          </div>
          <div class="col-span-4">
            <Select
              options="{['1', '2', '3', '4', '5', '6', '7', '8']}"
              bind:value="{selectedGroupDetailState[detailIdx].year}"
              on:change="{() => {
                sectionState[detailIdx].subjectId = [];
                selectedGroupDetailState[detailIdx].subjectId = [];
              }}"
              placeholder="Select Year"
            />
          </div>
        </section>
        <section id="input-subject" class="grid grid-cols-6">
          <div class="col-span-2 flex items-center">
            <label for="group" class="font-semibold">
              Subject <span class="text-red-600">*</span>
            </label>
          </div>
          <div class="col-span-4 grid auto-cols-fr">
            {#if subjectOptions.length === 0}No record{/if}
            {#each subjectOptions as subject}
              <label class="whitespace-nowrap px-4 font-semibold">
                <input
                  type="checkbox"
                  value="{subject.value}"
                  bind:group="{selectedGroupDetailState[detailIdx].subjectId}"
                />
                {subject.label}
              </label>
            {/each}
          </div>
        </section>
      {/each}
    </article>
  {/if}
  {#if sectionState.length > 0}
    <article class="mx-auto gap-2 space-y-4 rounded border bg-white p-4">
      {#each sectionState as section, sectionIdx}
        {#each section.subjectSection as subjectSec, subjectSecIdx}
          <h1 class="text-lg font-semibold">
            <span class="rounded bg-slate-900 px-2 py-1 text-white">
              {groupMap[section.groupId].name}
            </span>
            {subjectMap[subjectSec.subjectId].name}
          </h1>
          {#each subjectSec.section as _, secIdx}
            <div class="relative space-y-4 rounded border p-4">
              <button
                type="button"
                class="absolute right-0 top-0 p-3"
                on:click="{() => removeSection(sectionIdx, subjectSecIdx, secIdx)}"
              >
                <CrossIcon />
              </button>
              <span class="text-center text-lg font-semibold"
                >Section <span class="capitalize">{secIdx == 0 ? subjectSec.type : 'lab'}</span
                ></span
              >
              <section id="input-room" class="grid grid-cols-6">
                <div class="col-span-2 flex items-center">
                  <label for="room" class="font-semibold">
                    Room <span class="text-red-600">*</span>
                  </label>
                </div>
                <div class="col-span-4">
                  <Select
                    name="section-room"
                    options="{roomOptions}"
                    bind:value="{sectionState[sectionIdx].subjectSection[subjectSecIdx].section[
                      secIdx
                    ].roomId}"
                  />
                </div>
              </section>
              <section id="input-instructor" class="grid grid-cols-6">
                <div class="col-span-2 flex items-center">
                  <label for="instructor" class="font-semibold">
                    Instructor <span class="text-red-600">*</span>
                  </label>
                </div>
                <div class="col-span-4">
                  <Select
                    name="section-instructor"
                    options="{instructorOptions}"
                    bind:value="{sectionState[sectionIdx].subjectSection[subjectSecIdx].section[
                      secIdx
                    ].instructor}"
                    multiple
                  />
                </div>
              </section>
              <section id="input-capacity" class="grid grid-cols-6">
                <div class="col-span-2 flex items-center">
                  <label for="" class="font-semibold">
                    Capacity <span class="text-red-600">*</span>
                  </label>
                </div>
                <div class="col-span-4">
                  <input
                    type="number"
                    class="input"
                    bind:value="{sectionState[sectionIdx].subjectSection[subjectSecIdx].section[
                      secIdx
                    ].capacity}"
                  />
                </div>
              </section>
            </div>
          {/each}

          <button
            type="button"
            class="button w-full"
            on:click="{() => addSection(sectionIdx, subjectSecIdx)}">Add section</button
          >
        {/each}
      {/each}

      <button type="submit" class="button" on:click="{() => handleSubmit()}">Create</button>
    </article>
  {/if}
</div>
