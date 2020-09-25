<script>
  export let tag = 'div', text = 'Foo';
</script>

<svelte:element tag={tag}>
  <div>
    {text}
  </div>
</svelte:element>