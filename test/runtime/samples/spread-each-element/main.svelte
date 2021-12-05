<script>
	export let things;
</script>

{#each things as thing}
	<div {...thing}></div>
{/each}