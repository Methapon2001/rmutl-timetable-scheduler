<script lang="ts">
  import { createEventDispatcher, tick } from 'svelte';

  const dispatch = createEventDispatcher();

  export let id: string | undefined = undefined;
  export let name: string | undefined = undefined;
  export let placeholder: string | undefined = undefined;
  export let multiple = false;
  export let options: (
    | string
    | {
        label: string;
        value: string;
        disabled?: boolean;
        preselected?: boolean;
      }
  )[];
  export let value: string | string[] = multiple ? [] : '';
  export let selected: string[] =
    typeof value == 'string' && value != '' ? [value] : Array.isArray(value) ? value : [];

  let selectContainerRef: HTMLDivElement;
  let selectInputRef: HTMLInputElement;
  let activeIndex: number | null = null;
  let searchText = '';
  let open = false;

  $: value = multiple ? selected : selected[0] ?? '';
  $: matchedOptions = options.filter((opt, idx) => {
    if (options.indexOf(opt) != idx) return false;

    if (opt instanceof Object) {
      return (
        !selected.includes(opt.value) &&
        opt.label.toLowerCase().includes(searchText.toLowerCase()) &&
        options.findIndex(
          (op) =>
            op == opt.value ||
            (op instanceof Object && (op.value == opt.value || op.label == opt.label)),
        ) == idx
      );
    }
    return !selected.includes(opt) && opt.toLowerCase().includes(searchText);
  });

  function debounce<T extends (...args: any[]) => any>(
    func: T,
    wait: number,
  ): (...args: Parameters<T>) => void {
    let timeout: ReturnType<typeof setTimeout>;
    return (...args: Parameters<T>) => {
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
    activeIndex = null;
    selectInputRef.value = '';
    selectInputRef.blur();
  }

  function handleOutclick(event: MouseEvent | TouchEvent) {
    if (!selectContainerRef.contains(event.target as Node | null)) closeDropdown();
  }

  async function handleKeydown(event: KeyboardEvent) {
    let activeOption: (typeof options)[number] | null = null;

    switch (event.key) {
      case 'Escape':
      case 'Tab':
        if (event.key == 'Tab' && activeIndex != null) {
          event.preventDefault();
          add(matchedOptions[activeIndex]);
        } else {
          closeDropdown();
        }
        break;
      case 'Enter':
        event.preventDefault();
        if (activeIndex != null) add(matchedOptions[activeIndex]);
        break;
      case 'Backspace':
        if (selected.length > 0 && searchText == '') remove(selected.length - 1);
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
              ? matchedOptions.findIndex(
                  (opt) => typeof opt == 'string' || (opt instanceof Object && !opt.disabled),
                )
              : matchedOptions.findLastIndex(
                  (opt) => typeof opt == 'string' || (opt instanceof Object && !opt.disabled),
                );

          await tick();

          document.querySelector('ul.options.open > li.active')?.scrollIntoView({
            block: 'nearest',
          });
          return;
        }

        if (matchedOptions.every((opt) => opt instanceof Object && opt.disabled)) return;

        do {
          let increment = 0;

          if (event.key == 'ArrowDown') increment = 1;
          if (event.key == 'ArrowUp') increment = -1;

          activeIndex += increment;

          if (activeIndex > matchedOptions.length - 1) activeIndex = 0;
          if (activeIndex < 0) activeIndex = matchedOptions.length - 1;

          await tick();

          activeOption = matchedOptions[activeIndex];
        } while (activeOption instanceof Object && activeOption.disabled);

        document.querySelector('ul.options.open > li.active')?.scrollIntoView({
          block: 'nearest',
        });
        break;
    }
  }

  function add(opt: (typeof matchedOptions)[number]) {
    if (typeof opt == 'string') selected = multiple ? [...selected, opt] : [opt];

    if (opt instanceof Object && !opt.disabled)
      selected = multiple ? [...selected, opt.value] : [opt.value];

    searchText = '';
    selectInputRef.value = '';
    selectInputRef.focus();
    activeIndex = null;

    dispatch('change', {
      value,
    });

    if (!multiple) closeDropdown();
  }

  function remove(index: number) {
    selected = selected.filter((_, idx) => idx != index);

    if (open) selectInputRef.focus();
  }

  function removeAll() {
    selected = [];

    dispatch('change');

    if (open) selectInputRef.focus();
  }
</script>

<svelte:window on:touchstart={handleOutclick} on:click={handleOutclick} />

<div class="svs" bind:this={selectContainerRef} on:mouseup|stopPropagation={openDropdown}>
  <ul class="selected">
    {#each selected as val, idx (val)}
      {@const opt = options.find((op) => {
        return op == val || (op instanceof Object && op.value == val);
      })}
      <li>
        {opt instanceof Object ? opt.label : opt}
        <button
          on:mouseup|stopPropagation={() => remove(idx)}
          on:keydown={(e) => {
            if (e.code == 'Enter' || e.code == 'Space') {
              e.preventDefault();
              remove(idx);
            }
          }}
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
            />
          </svg>
        </button>
      </li>
    {/each}
    <input
      {id}
      {name}
      placeholder={selected.length == 0 ? placeholder : undefined}
      autocomplete="off"
      type="text"
      bind:this={selectInputRef}
      on:input={handleInput}
      on:focus={openDropdown}
      on:mouseup|self|stopPropagation={openDropdown}
      on:keydown|stopPropagation={handleKeydown}
    />
  </ul>
  {#if selected.length > 1}
    <button
      class="clear"
      on:mouseup|stopPropagation={() => removeAll()}
      on:keydown={(e) => {
        if (e.code == 'Enter' || e.code == 'Space') {
          e.preventDefault();
          removeAll();
        }
      }}
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
        />
      </svg>
    </button>
  {/if}
  <div class="chevron">
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 20 20"
      fill="currentColor"
      height="16"
      width="16"
    >
      <path
        fill-rule="evenodd"
        d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
        clip-rule="evenodd"
      />
    </svg>
  </div>

  <ul class="options" class:open>
    {#each matchedOptions as opt, idx (opt instanceof Object ? opt.value : opt)}
      {@const { label, disabled = false } = opt instanceof Object ? opt : { label: opt }}
      <li
        class:disabled={opt instanceof Object && opt.disabled}
        class:active={activeIndex == idx}
        on:mouseup|stopPropagation={() => add(opt)}
        on:mouseover={() => {
          if (!disabled) activeIndex = idx;
        }}
        on:mouseout={() => {
          if (!disabled) activeIndex = null;
        }}
        on:focus={() => {
          if (!disabled) activeIndex = idx;
        }}
        on:blur={() => {
          if (!disabled) activeIndex = null;
        }}
      >
        {label}
      </li>
    {/each}

    {#if matchedOptions.length == 0}
      <li style="cursor: default;">No options found.</li>
    {/if}
  </ul>
</div>

<style>
  .svs {
    --svs-spacing: 0.5rem;
    --svs-max-height: 16rem;
    --svs-border-radius: 0.5rem;
    --svs-color: #000;
    --svs-background-color: var(--color-light);
    --svs-background-color-active: var(--color-light-hover);
    --svs-selected-color: hsl(204 10% 50% / 0.2);
    --svs-option-background-color: #fff;
    --svs-option-background-color-active: var(--color-light);
    --svs-border: 1px solid transparent;
    --svs-icon-color: hsl(204, 10%, 50%);
  }

  input {
    flex: 1;
    min-width: 2rem;
    background-color: transparent;
  }

  input:focus {
    outline: none;
    box-shadow: none;
  }

  .svs {
    display: flex;
    position: relative;
    color: var(--svs-color);
    border: var(--svs-border);
    border-radius: var(--svs-border-radius);
    background-color: var(--svs-background-color);
  }

  .svs > :where(.chevron, .clear) {
    display: flex;
    align-items: center;
    padding: var(--svs-spacing);
    color: var(--svs-icon-color);
  }

  .svs:has(> .options.open) {
    background-color: var(--svs-background-color-active);
  }

  .svs > .selected {
    flex-grow: 1;
    display: flex;
    flex-wrap: wrap;
    white-space: nowrap;
    gap: var(--svs-spacing);
    padding: var(--svs-spacing);
  }

  .svs > .selected > li {
    flex: 1 auto content;
    display: flex;
    align-items: center;
    background-color: var(--svs-selected-color);
    border-radius: var(--svs-border-radius);
  }

  .svs > .selected > :where(input, li) {
    padding: 0 var(--svs-spacing);
  }

  .svs > .selected > li > button {
    border-radius: var(--svs-border-radius);
    margin-left: var(--svs-spacing);
    color: var(--svs-icon-color);
  }

  .svs > .selected > input {
    padding-left: 0;
    padding-right: 0;
  }

  .svs > .options {
    position: absolute;
    display: none;
    overflow-y: auto;
    box-shadow: 0 1px 6px 0 rgba(0, 0, 0, 0.1), 0 1px 4px -1px rgba(0, 0, 0, 0.2);
    top: 100%;
    width: 100%;
    border: 1px solid var(--svs-border);
    background-color: var(--svs-option-background-color);
    border-radius: var(--svs-border-radius);
    max-height: var(--svs-max-height);
    border: 1px solid hsl(204 10% 50% / 0.2);
    z-index: 999;
  }

  .svs > .options.open {
    display: block;
  }

  .svs > .options > li {
    cursor: pointer;
    padding: calc(var(--svs-spacing) / 2) var(--svs-spacing);
  }

  .svs > .options > li:last-child {
    margin-bottom: 0;
  }

  .svs > .options > li.disabled {
    cursor: default;
    color: var(--svs-selected-color);
  }

  .svs > .options > li.active:not(.disabled) {
    background-color: var(--svs-option-background-color-active);
  }
</style>
