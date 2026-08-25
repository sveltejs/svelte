<script>
	let unmatched = $state('zzz');
	let nothing = $state(null);
	let defaultValue = $state('b');
	let props = $state({ defaultValue: 'b', class: 'one' });
	let late = $state([]);
	let options = $state(['a', 'b', 'c']);
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

<select defaultValue="b">
	{#each late as option}<option value={option}>{option}</option>{/each}
</select>

<select {defaultValue}>
	{#each options as option}<option value={option}>{option}</option>{/each}
</select>

<button onclick={() => (defaultValue = 'a')}>change default</button>
<button onclick={() => (props.class = 'two')}>change class</button>
<button onclick={() => (late = ['a', 'b', 'c'])}>load options</button>
<button onclick={() => options.push('d')}>add option</button>
<p>{unmatched} {String(nothing)}</p>
