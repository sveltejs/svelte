<script>
  let target;

  const slot = $$slots.default();
  
  $: {
    if (target) {
      slot.content[0].setAttribute('attr', 'value');
      slot.content[2].$set({ prop: 'bar' })
      slot.mount(target);
    }
  }
</script>

<div bind:this={target} />
