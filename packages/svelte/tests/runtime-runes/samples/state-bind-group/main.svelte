<script>
	let checkboxes = $state([]);
	let values = ['1', '2', '3'];
</script>

<button onclick={() => checkboxes.push('2')}>+</button>

{#each values as val, i}
	<input type="checkbox" value={val} bind:group={checkboxes} />
{/each}

{JSON.stringify(checkboxes)}
