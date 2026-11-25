<script>
	let color = $state(null);
	let range = $state();
	let text = $state(null);
	let with_default = $state(null);
	let from_spread = $state(null);
</script>

<input type="color" bind:value={color} />
<input type="range" bind:value={range} />
<input type="text" bind:value={text} />
<input type="color" defaultValue="#ff0000" bind:value={with_default} />
<input type="range" min="0" max="10" {...{ value: 3 }} bind:value={from_spread} />

<p>{JSON.stringify([color, range, text, with_default, from_spread])}</p>
