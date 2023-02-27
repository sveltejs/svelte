<script>
	let options = [1,2,3]
	export let selected = [[1,2,3]];
</script>

{#each options as value}
	<label>
		<input 
			type='checkbox'
			bind:group={selected[0]} 
			value={value}
		/>
		{value}
	</label>
{/each}

<p>{selected[0].join(', ')}</p>