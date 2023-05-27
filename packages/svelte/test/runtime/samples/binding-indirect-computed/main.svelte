<script>
	export let letters = [
		'a',
		'b',
		'c'
	];
	export let selected = {
		letter: ''
	};

	function uppercase() {
		return letters.map(x => x.toUpperCase());
	}
</script>

<select bind:value={selected.letter}>
	{#each uppercase() as letter}
		<option value="{letter}">{letter}</option>
	{/each}
</select>

{selected.letter}