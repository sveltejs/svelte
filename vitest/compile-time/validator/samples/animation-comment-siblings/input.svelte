<script>
	export let things;
	function foo() {}
</script>

{#each things as thing (thing)}
	<!-- some comment -->
	<div animate:foo></div>
{/each}