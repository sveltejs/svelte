<script>
  export let tag = 'div', text = 'Foo';
</script>

<svelte:element this={tag}>
  <div>
    {text}
  </div>
</svelte:element>