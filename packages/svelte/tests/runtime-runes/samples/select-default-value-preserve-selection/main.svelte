<script>
	let unmatched = $state('zzz');
	let nothing = $state(null);
	let defaultValue = $state('b');
	let props = $state({ defaultValue: 'b', class: 'one' });
</script>

<select value={null} {defaultValue}>
	<option value="a">A</option>
	<option value="b">B</option>
</select>

<select bind:value={unmatched} {defaultValue}>
	<option value="a">A</option>
	<option value="b">B</option>
</select>

<select {...props} bind:value={nothing}>
	<option value="a">A</option>
	<option value="b">B</option>
</select>

<button onclick={() => (defaultValue = 'a')}>change default</button>
<button onclick={() => (props.class = 'two')}>change class</button>
<p>{unmatched} {String(nothing)}</p>
