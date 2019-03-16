<script>
	export let selected;
	export let values;
</script>

{#each values as value}
	<label>
		<input type="radio" value="{value}" bind:group={selected} /> {value.name}
	</label>
{/each}

<p>{selected.name}</p>