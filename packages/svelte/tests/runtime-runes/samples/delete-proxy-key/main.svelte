<script>
	let obj = $state({test: 0})

	let keys = $derived(Object.keys(obj));
</script>

<button onclick={() => delete obj.test}>
	delete
</button>

{#each keys as key}
	<p>{key}</p>
{/each}
