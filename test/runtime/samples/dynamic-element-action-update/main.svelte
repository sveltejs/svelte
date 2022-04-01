<script>
	export let updateText = "";
	export let destroyText = "";
  export let tag = "h1";
  export let opt = "opt1";
  function foo(node, {tag, opt}) {
    return {
      update: ({tag, opt}) => updateText = `update: ${tag},${opt}`,
      destroy: () => destroyText = 'destroy'
    };
  }
</script>

<svelte:element this={tag} use:foo={{tag, opt}}>tag is {tag}.</svelte:element>
