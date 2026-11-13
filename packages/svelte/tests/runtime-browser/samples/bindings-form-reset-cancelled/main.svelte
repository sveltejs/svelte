<script>
	let checked = $state(false);
	let text = $state('');
	let selected = $state('a');
	let cancel = true;
</script>

<form onreset={(e) => {
	e.stopPropagation();
	if (cancel) e.preventDefault();
}}>
	<input type="checkbox" bind:checked />
	<input bind:value={text} />
	<select bind:value={selected}>
		<option value="a">a</option>
		<option value="b">b</option>
	</select>
	<button type="reset">Reset</button>
	<input type="reset" />
</form>

<button onclick={() => cancel = false}>Allow reset</button>
<p>checked: {checked}, text: {JSON.stringify(text)}, selected: {selected}</p>
