<script>
	export let updateText = "";
	export let destroyText = "";
  export let tag = "h1";
  function foo(node, tag) {
    return {
      update: (tag) => updateText = `update: ${tag}`,
      destroy: () => destroyText = 'destroy'
    };
  }
</script>

<svelte:element this={tag} use:foo={tag}>tag is {tag}.</svelte:element>
