<script>
	const options = ['h1', 'h3', 'p'];
	let selected = options[0];
</script>

<select bind:value={selected}>
	{#each options as option}
		<option value={option}>{option}</option>
	{/each}
</select>

{#if selected === 'h1'}
	<h1>I'm a h1 tag</h1>
{:else if selected === 'h3'}
	<h3>I'm a h3 tag</h3>
{:else if selected === 'p'}
	<p>I'm a p tag</p>
{/if}
