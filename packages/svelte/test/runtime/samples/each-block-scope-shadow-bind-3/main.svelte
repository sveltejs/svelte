<script>
	let a = [
		['Hello', 'World'],
		['Sapper', 'App'],
	]
</script>

{#each a as a}
	<div>
		{a[0]} {a[1]}
		<input bind:value={a[0]}>
		<input bind:value={a[1]}>
	</div>
{/each}