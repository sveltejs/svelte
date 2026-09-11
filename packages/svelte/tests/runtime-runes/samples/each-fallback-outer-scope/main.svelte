<script>
	let items = $state([]);
	let item = $state('outer');
</script>

{#each items as item}
	<p>{item}</p>
{:else}
	<button onclick={() => (item = 'changed')}>{item}</button>
{/each}
