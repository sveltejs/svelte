<script>
  const tag = "div";
  export let onClick;
</script>

<svelte:element this={tag} style="display: inline;" on:click={onClick}>Foo</svelte:element>