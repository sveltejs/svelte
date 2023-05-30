<script>
	export let bindings = {};
</script>

{#each [{ outer: [10] }, { outer: [20] }, { outer: [30] }] as { outer } }
	<p bind:this={bindings[outer[0]]}>{outer[0]}</p>
{/each}
