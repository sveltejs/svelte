<script>
	let selected1 = $state();
	let selected2 = $state('c');
	let selected3 = $state();
	let selected4 = $state(['c']);
	let defaultValue = $state('b');
	let multipleDefault = $state(/** @type {string[] | undefined} */ (['a', 'c']));
	let options = $state(['a']);
	let props = $state({ defaultValue: 'b' });
</script>

<form>
	<select {defaultValue} bind:value={selected1}>
		<option value="a">A</option>
		<option value="b">B</option>
		<option value="c">C</option>
	</select>

	<select {defaultValue} bind:value={selected2}>
		<option value="a">A</option>
		<option value="b">B</option>
		<option value="c">C</option>
	</select>

	<select {defaultValue}>
		<option value="a">A</option>
		<option value="b">B</option>
		<option value="c">C</option>
	</select>

	<select defaultValue="b">
		{#each options as option}
			<option value={option}>{option}</option>
		{/each}
	</select>

	<select defaultvalue="b">
		<option value="a">A</option>
		<option value="b">B</option>
	</select>

	<select {...props} bind:value={selected3}>
		<option value="a">A</option>
		<option value="b">B</option>
		<option value="c">C</option>
	</select>

	<select {...{ defaultValue: 'b' }} defaultValue="a">
		<option value="a">A</option>
		<option value="b">B</option>
	</select>

	<select multiple defaultValue={multipleDefault}>
		<option value="a">A</option>
		<option value="b">B</option>
		<option value="c">C</option>
	</select>

	<select multiple defaultValue={multipleDefault} bind:value={selected4}>
		<option value="a">A</option>
		<option value="b">B</option>
		<option value="c">C</option>
	</select>

	<input type="reset" value="Reset" />
	<button
		type="button"
		class="update"
		onclick={() => {
			defaultValue = 'a';
			props.defaultValue = 'a';
		}}>Update defaults</button
	>
	<button type="button" class="add" onclick={() => options.push('b')}>Add option</button>
	<button type="button" class="remove" onclick={() => delete props.defaultValue}>Remove default</button>
	<button type="button" class="clear" onclick={() => (multipleDefault = undefined)}>Clear defaults</button>
</form>

<p>{selected1} {selected2} {selected3} {selected4.join(',')}</p>
