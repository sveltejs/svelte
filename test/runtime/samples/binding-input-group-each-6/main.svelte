<script>
	const values = ['x', 'y', 'z'];
	const list = {
		a: [],
		b: [],
		c: [],
	};
</script>

{#each Object.keys(list) as key}
	{#each values as value}
		<label>
			<input 
				type='checkbox'
				bind:group={list[key]}
				value={value}
			/>
			{value}
		</label>
	{/each}
	<p>{list[key].join(', ')}</p>
{/each}
