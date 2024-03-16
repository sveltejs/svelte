<script>
	let text = $state('text');
	let checkbox = $state(true);
	let radio_group = $state('a');
	let checkbox_group = $state(['a']);
	let select = $state('b');
	let textarea = $state('textarea');
</script>

<p>{JSON.stringify({ text, checkbox, radio_group, checkbox_group, select, textarea })}</p>

<form>
	<input bind:value={text} />
	
	<input type="checkbox" bind:checked={checkbox} />
	
	<input type="radio" name="radio" value="a" bind:group={radio_group} />
	<input type="radio" name="radio" value="b" bind:group={radio_group} />
	
	<input type="checkbox" name="checkbox" value="a" bind:group={checkbox_group} />
	<input type="checkbox" name="checkbox" value="b" bind:group={checkbox_group} />

	<select bind:value={select}>
		<option value="a">a</option>
		<option value="b">b</option>
	</select>

	<textarea bind:value={textarea}></textarea>

	<button type="button" onclick={(e) => e.target.form.reset()}>Reset</button>
</form>
