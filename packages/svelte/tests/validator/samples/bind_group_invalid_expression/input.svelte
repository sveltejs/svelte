<script>
	let values = $state([{ name: 'Alpha' }, { name: 'Beta' }, { name: 'Gamma' }]);
	let selected = $state(values[1]);
</script>

{#each values as value}
	<label>
		<input type="radio" value="{value}" bind:group={() => selected, v => selected = v} /> {value.name}
	</label>
{/each}

<p>{selected.name}</p>
