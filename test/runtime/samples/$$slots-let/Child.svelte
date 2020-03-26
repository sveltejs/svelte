<script>
  const slot = $$slots.default({ value: 'foo' })
  let target
  $: target && slot.mount(target)
</script>

<button on:click={e => slot.update({ value: 'bar' })}>Click me</button>
<div bind:this={target} />
