<script>
	const options = [1, 2, 3];
	export let selected_array = [
		[[1], [1, 2, 3]], 
		[[2], [1]],
	];
	export let selected_index = [0, 1];
</script>

{#each selected_array as selected}
	{#each selected_index as index}
		{#each options as value}
			<label>
				<input 
					type='checkbox'
					bind:group={selected[index]}
					value={value}
				/>
				{value}
			</label>
		{/each}
		<p>{selected[index].join(', ')}</p>
	{/each}
{/each}
