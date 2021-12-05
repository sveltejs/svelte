<script>
	function foo() {}
	function bar() {}
</script>

{#each things as thing (thing)}
	<div animate:foo animate:bar></div>
{/each}