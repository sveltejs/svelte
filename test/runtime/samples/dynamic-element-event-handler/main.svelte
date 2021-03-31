<script>
  const tag = "button";
  export let handler;
</script>

<svelte:element tag={tag} on:click={handler}>Foo</svelte:element>