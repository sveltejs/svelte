<script>
	const options = [1, 2, 3];
	export let selected_array_1 = [[1], [2]];
	export let selected_array_2 = [[], [3]];
</script>

{#each selected_array_1 as selected}
	{#each options as value}
		<label>
			<input 
				type='checkbox'
				bind:group={selected} 
				value={value}
			/>
			{value}
		</label>
	{/each}
	<p>{selected.join(', ')}</p>
{/each}

{#each selected_array_2 as selected}
	{#each options as value}
		<label>
			<input 
				type='checkbox'
				bind:group={selected} 
				value={value}
			/>
			{value}
		</label>
	{/each}
	<p>{selected.join(', ')}</p>
{/each}