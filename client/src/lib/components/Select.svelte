<script lang="ts">
  import { tick, createEventDispatcher } from 'svelte';

  export let id: string | undefined = undefined;
  export let name: string | undefined = undefined;
  export let placeholder: string | undefined = undefined;
  export let options: (
    | string
    | {
        label: string;
        value: string;
        disabled?: boolean;
        [key: string]: unknown;
      }
  )[];
  export let multiple = false;
  export let value: string | string[] = multiple ? [] : '';

  const dispatch = createEventDispatcher<{
    change: null;
    select: (typeof options)[number];
  }>();

  let selectContainerRef: HTMLDivElement;
  let selectInputRef: HTMLInputElement;
  let activeIndex: number | null = null;
  let searchText = '';
  let open = false;

  $: filteredOptions = options
    .map((option) => {
      return typeof option === 'string' ? { label: option, value: option } : option;
    })
    .filter((option, idx, arr) => {
      return (
        arr.findIndex((opt) => opt.value === option.value || opt.label == option.label) === idx
      );
    });

  $: matchedOptions = filteredOptions.filter((option) => {
    const val = Array.isArray(value) ? value : value != '' ? [value] : [];

    return (
      !val.includes(option.value) &&
      option.label.toLocaleLowerCase().includes(searchText.toLocaleLowerCase())
    );
  });

  $: selectedValues = Array.isArray(value)
    ? value.filter((val, idx, arr) => arr.findIndex((v) => v === val) === idx)
    : value !== ''
      ? [value]
      : [];

  $: selectedOptions = selectedValues.map(
    (v) => filteredOptions.find((opt) => opt.value === v) ?? { label: v, value: v },
  );

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  function debounce<TFunction extends (...args: any[]) => any>(
    func: TFunction,
    wait: number,
  ): (...args: Parameters<TFunction>) => void {
    let timeout: ReturnType<typeof setTimeout>;
    return (...args: Parameters<TFunction>) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func(...args), wait);
    };
  }

  const handleInput = debounce(() => {
    searchText = selectInputRef.value;
    activeIndex = 0;
  }, 300);

  function openDropdown(event: MouseEvent | FocusEvent) {
    open = true;
    if (!(event instanceof FocusEvent)) selectInputRef.focus();
  }

  function closeDropdown() {
    open = false;
    searchText = '';
    activeIndex = null;
    selectInputRef.value = '';
    selectInputRef.blur();
  }

  function handleOutclick(event: MouseEvent | TouchEvent) {
    if (!selectContainerRef.contains(event.target as Node | null)) closeDropdown();
  }

  async function scrollActiveIntoView() {
    await tick();

    document.querySelector('ul.options.open > li.active')?.scrollIntoView({
      block: 'nearest',
    });
  }

  async function handleKeydown(event: KeyboardEvent) {
    let activeOption: (typeof matchedOptions)[number] | null =
      activeIndex != null ? matchedOptions[activeIndex] : null;

    switch (event.key) {
      case 'Escape':
        closeDropdown();
        break;
      case 'Tab':
        if (activeIndex != null) {
          event.preventDefault();
          add(activeOption);
        } else {
          closeDropdown();
        }
        break;
      case 'Enter':
        event.preventDefault();
        if (activeOption != null) add(activeOption);
        break;
      case 'Backspace':
        if (value.length > 0 && searchText == '') remove(-1);
        break;
      case 'ArrowDown':
      case 'ArrowUp':
        event.preventDefault();

        if (matchedOptions.length == 0) {
          activeIndex = null;
          return;
        }

        if (activeIndex == null) {
          activeIndex =
            event.key == 'ArrowDown'
              ? matchedOptions.findIndex((opt) => !opt.disabled)
              : matchedOptions.findLastIndex((opt) => !opt.disabled);

          scrollActiveIntoView();
          return;
        }

        if (matchedOptions.every((opt) => opt.disabled)) return;

        do {
          let increment = 0;

          if (event.key == 'ArrowDown') increment = 1;
          if (event.key == 'ArrowUp') increment = -1;

          activeIndex += increment;

          if (activeIndex > matchedOptions.length - 1) activeIndex = 0;
          if (activeIndex < 0) activeIndex = matchedOptions.length - 1;

          activeOption = matchedOptions[activeIndex];
        } while (activeOption.disabled);

        scrollActiveIntoView();
        break;
    }
  }

  async function add(option: (typeof matchedOptions)[number] | null) {
    if (!option || option.disabled) return;

    if (!multiple) {
      value = option.value;
      closeDropdown();
    } else {
      value = Array.isArray(value) ? [...value, option.value] : [option.value];
      selectInputRef.focus();
    }

    await tick();

    searchText = '';
    selectInputRef.value = '';

    dispatch('change', null);
    dispatch('select', option);
  }

  async function remove(index: number) {
    if (!multiple) {
      value = '';
    } else if (!Array.isArray(value)) {
      value = [];
    } else {
      value = index === -1 ? value.slice(0, -1) : value.filter((_, idx) => idx !== index);
    }

    if (open) selectInputRef.focus();

    await tick();

    dispatch('change', null);
  }

  async function removeAll() {
    if (!multiple) {
      value = '';
    } else {
      value = [];
    }

    if (open) selectInputRef.focus();

    await tick();

    dispatch('change', null);
  }
</script>

<svelte:window on:touchstart="{handleOutclick}" on:click="{handleOutclick}" />

<div
  class="svs"
  bind:this="{selectContainerRef}"
  on:mouseup|stopPropagation="{openDropdown}"
  role="none"
>
  <select id="{id}" name="{name}" multiple="{multiple}" tabindex="-1" aria-hidden="true">
    {#each selectedOptions as option (option.value)}
      <option value="{option.label}" selected>{option.value}</option>
    {/each}
  </select>

  <ul class="selected">
    {#each selectedOptions as option, idx (option.value)}
      <li>
        <span>
          {option.label}
        </span>
        <button
          on:mouseup|stopPropagation="{() => remove(idx)}"
          on:keydown="{(e) => {
            if (e.code == 'Enter' || e.code == 'Space') {
              e.preventDefault();
              remove(idx);
            }
          }}"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            height="16"
            width="16"
          >
            <path
              d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z"
            ></path>
          </svg>
        </button>
      </li>
    {/each}
    <input
      placeholder="{selectedValues.length == 0 ? placeholder : undefined}"
      autocomplete="off"
      type="text"
      bind:this="{selectInputRef}"
      on:input="{handleInput}"
      on:focus="{openDropdown}"
      on:mouseup|self|stopPropagation="{openDropdown}"
      on:keydown|stopPropagation="{handleKeydown}"
    />
  </ul>

  {#if selectedValues.length > 1}
    <button
      class="clear"
      on:mouseup|stopPropagation="{() => removeAll()}"
      on:keydown="{(e) => {
        if (e.code == 'Enter' || e.code == 'Space') {
          e.preventDefault();
          removeAll();
        }
      }}"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 20 20"
        fill="currentColor"
        height="16"
        width="16"
      >
        <path
          d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z"
        ></path>
      </svg>
    </button>
  {/if}

  <ul class="options" class:open="{open}">
    {#each matchedOptions as opt, idx (opt.value)}
      <li
        role="none"
        class:disabled="{opt.disabled}"
        class:active="{activeIndex == idx}"
        on:mouseup|stopPropagation="{() => add(opt)}"
        on:mouseover="{() => {
          if (!opt.disabled) activeIndex = idx;
        }}"
        on:mouseout="{() => {
          if (!opt.disabled) activeIndex = null;
        }}"
        on:focus="{() => {
          if (!opt.disabled) activeIndex = idx;
        }}"
        on:blur="{() => {
          if (!opt.disabled) activeIndex = null;
        }}"
      >
        {opt.label}
      </li>
    {/each}

    {#if matchedOptions.length == 0}
      <li style="cursor: default;">No options found.</li>
    {/if}
  </ul>
</div>

<style>
  :root {
    --svs-border-radius: 0.5rem;

    --svs-padding-verticle: 0.25rem;
    --svs-padding-horizontal: 0.25rem;

    --svs-selected-input-padding-verticle: 0.25rem;
    --svs-selected-input-padding-horizontal: 0.5rem;

    --svs-options-padding-verticle: 0.25rem;
    --svs-options-padding-horizontal: 0.75rem;

    --svs-selected-input-gap: 0.4rem;

    --svs-color: #000;
    --svs-color-active: #000;

    --svs-selected-color: #000;

    --svs-options-color: #000;
    --svs-options-color-active: #000;
    --svs-options-color-disabled: hsl(240 30% 50% / 0.3);

    --svs-icon-color: hsl(240 30% 50% / 0.5);
    --svs-icon-color-active: hsl(240 30% 50% / 0.8);

    --svs-background-color: #fff;
    --svs-background-color-active: #fff;

    --svs-selected-background-color: hsl(240 30% 50% / 0.1);

    --svs-icon-background-color: transparent;
    --svs-icon-background-color-active: transparent;

    --svs-dropdown-background-color: #fff;

    --svs-options-background-color: #fff;
    --svs-options-background-color-active: hsl(240 30% 70% / 0.1);
    --svs-options-background-color-disabled: #fff;

    --svs-border-color: hsl(240 30% 50% / 0.2);
    --svs-border-color-active: hsl(240 30% 50% / 0.5);

    --svs-selected-border-color: transparent;

    --svs-dropdown-border-color: hsl(240 30% 50% / 0.2);

    --svs-shadow: 0 2px 6px -1px hsl(0 0% 0% / 0.1);

    --svs-dropdown-shadow: 0 4px 12px hsl(0 0% 0% / 0.175);

    --svs-dropdown-margin: 0.25rem;
    --svs-dropdown-max-height: 16rem;
    --svs-dropdown-z-index: 30;
  }

  *,
  ::before,
  ::after {
    border-width: 0px;
    border-style: solid;
  }

  button {
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: transparent;
    background-image: none;
    padding: 0;
    margin: 0;
  }

  ul {
    list-style: none;
    padding: 0;
    margin: 0;
  }

  input {
    flex: 1;
    min-width: 1rem;
    border-width: 1px;
    border-color: transparent;
    background-color: transparent;
    transition: none;
  }

  input:focus {
    outline: none;
    box-shadow: none;
  }

  select {
    display: none;
  }

  .svs {
    display: flex;
    position: relative;
    border-width: 1px;
    border-color: var(--svs-border-color);
    border-radius: var(--svs-border-radius);
    background-color: var(--svs-background-color);
    color: var(--svs-color);
    box-shadow: var(--svs-shadow);
  }

  .svs > .selected {
    flex-grow: 1;
    display: flex;
    flex-wrap: wrap;
    white-space: nowrap;
    gap: var(--svs-selected-input-gap);
    padding: var(--svs-padding-verticle) var(--svs-padding-horizontal);
  }

  .svs > .clear {
    border-radius: var(--svs-border-radius);
    padding: var(--svs-padding-verticle) var(--svs-padding-horizontal);
    color: var(--svs-icon-color);
  }
  .svs > .clear:hover {
    color: var(--svs-icon-color-active);
  }

  .svs > .selected > li {
    display: flex;
    align-items: center;
    border-width: 1px;
    border-color: var(--svs-selected-border-color);
    border-radius: var(--svs-border-radius);
    color: var(--svs-selected-color);
    background-color: var(--svs-selected-background-color);
  }

  .svs > .selected > li > span {
    white-space: normal;
    word-wrap: break-word;
  }

  .svs > .selected > :where(input, li) {
    padding: var(--svs-selected-input-padding-verticle) var(--svs-selected-input-padding-horizontal);
  }

  .svs > .selected > li > button {
    margin-left: 0.3rem;
    border-radius: var(--svs-border-radius);
    color: var(--svs-icon-color);
    background-color: var(--svs-icon-background-color);
  }

  .svs > .selected > li > button:hover {
    color: var(--svs-icon-color-active);
    background-color: var(--svs-icon-background-color-active);
  }

  .svs > .selected > input {
    padding-left: var(--svs-selected-input-padding-horizontal);
    padding-right: var(--svs-selected-input-padding-horizontal);
  }

  .svs > .selected > input:not(:only-child) {
    padding-left: 0;
    padding-right: 0;
  }

  .svs > .options {
    position: absolute;
    display: none;
    overflow-y: auto;
    top: 100%;
    width: 100%;
    border-width: 1px;
    border-radius: var(--svs-border-radius);
    border-color: var(--svs-dropdown-border-color);
    box-shadow: var(--svs-dropdown-shadow);
    max-height: var(--svs-dropdown-max-height);
    margin-top: var(--svs-dropdown-margin);
    background-color: var(--svs-dropdown-background-color);
    z-index: var(--svs-dropdown-z-index);
  }

  .svs:has(> .open) {
    color: var(--svs-color-active);
    border-color: var(--svs-border-color-active);
    background-color: var(--svs-background-color-active);
  }

  .svs > .options.open {
    display: block;
  }

  .svs > .options > li {
    cursor: pointer;
    padding: var(--svs-options-padding-verticle) var(--svs-options-padding-horizontal);
  }

  .svs > .options > li.disabled {
    cursor: default;
    color: var(--svs-options-color-disabled);
    background-color: var(--svs-options-background-color-disabled);
  }

  .svs > .options > li.active:not(.disabled) {
    color: var(--svs-options-color-active);
    background-color: var(--svs-options-background-color-active);
  }
</style>
