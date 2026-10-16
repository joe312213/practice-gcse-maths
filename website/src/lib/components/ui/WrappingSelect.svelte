<!-- Shared accessible choice control for prose options that must wrap at any width. -->
<script>
  import { Select } from 'bits-ui';
  let {
    id,
    options,
    value = '',
    placeholder = 'Choose an option',
    disabled = false,
    required = true,
    onchange,
    ...rest
  } = $props();
  const selected = $derived(options.find((option) => option.id === value));
</script>

<Select.Root type="single" name={id} {value} {disabled} {required} onValueChange={onchange}>
  <Select.Trigger {id} {...rest} class="choice-field wrapping-choice">
    {selected?.text ?? placeholder}
  </Select.Trigger>
  <Select.Portal>
    <Select.Content
      class="popover-panel choice-options"
      align="start"
      sideOffset={4}
      collisionPadding={16}
    >
      <Select.Viewport>
        {#each options as option}
          <Select.Item class="choice-option" value={option.id} label={option.text}>
            {#snippet children({ selected })}
              <span aria-hidden="true">{selected ? '✓' : ''}</span><span>{option.text}</span>
            {/snippet}
          </Select.Item>
        {/each}
      </Select.Viewport>
    </Select.Content>
  </Select.Portal>
</Select.Root>
