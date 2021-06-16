<script>
  let heading = 'h1';
  let tag = 'div';
</script>

<svelte:element tag={heading}>Foo</svelte:element>
<svelte:element {tag}>Bar</svelte:element>