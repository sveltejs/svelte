<script>
	let entries = $state([{selected: 'a'}])
</script>

{#each entries as entry}
	{entry.selected} <select bind:value={entry.selected}></select>
{/each}

<button
	on:click={
		() => entries = [{selected: 'a'}, {selected: 'b'}]
	}
	>change</button>
