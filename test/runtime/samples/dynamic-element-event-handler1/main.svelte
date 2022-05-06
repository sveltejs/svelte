<script>
  const tag = "button";
  export let handler;
</script>

<svelte:element this={tag} on:click={handler}>Foo</svelte:element>