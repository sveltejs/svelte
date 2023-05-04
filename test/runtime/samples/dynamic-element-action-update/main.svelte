<script>
  export let pushLogs;
	export let tag = "h1";
  export let opt = "opt1";
  function foo(node, {tag, opt}) {
    pushLogs(`create: ${tag},${opt}`);
    return {
      update: ({tag, opt}) => pushLogs(`update: ${tag},${opt}`),
      destroy: () => pushLogs('destroy'),
    };
  }
</script>

<svelte:element this={tag} use:foo={{tag, opt}}>tag is {tag}.</svelte:element>
