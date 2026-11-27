<script>
	let text = $state();
	let rows = $state([{ key: 'a' }, { key: 'b' }]);

	/** @param {string} key */
	const label = (key) => `seed ${key}`;
</script>

<div contenteditable="true" bind:textContent={text}><em>{label('x')}</em></div>

{#each rows as row (row.key)}
	<div contenteditable="true" bind:textContent={row.text}><em>{label(row.key)}</em></div>
{/each}
