<script>
  const tag = "div";
  export let onClick;
</script>

<svelte:element tag={tag} style="display: inline;" on:click={onClick}>Foo</svelte:element>