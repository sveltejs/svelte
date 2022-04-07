<script>
  export let logs = [];
	export let tag = "h1";
  export let opt = "opt1";
  function foo(node, {tag, opt}) {
    logs.push(`create: ${tag},${opt}`);
    return {
      update: ({tag, opt}) => logs.push(`update: ${tag},${opt}`),
      destroy: () => logs.push('destroy'),
    };
  }
</script>

<svelte:element this={tag} use:foo={{tag, opt}}>tag is {tag}.</svelte:element>
