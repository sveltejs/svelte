<script>
	let selected1 = $state();
	let selected2 = $state('c');
	let selected3 = $state();

	let defaultValue = $state('b');
</script>

<form>
	<!-- defaultValue=b, value=undefined -->
	<select {defaultValue} bind:value={selected1}>
		<option value="a">A</option>
		<option value="b">B</option>
		<option value="c">C</option>
	</select>

	<!-- defaultValue=b, value=c -->
	<select {defaultValue} bind:value={selected2}>
		<option value="a">A</option>
		<option value="b">B</option>
		<option value="c">C</option>
	</select>

	<!-- static defaultValue -->
	<select defaultValue="b" bind:value={selected3}>
		<option value="a">A</option>
		<option value="b">B</option>
		<option value="c">C</option>
	</select>

	<input type="reset" value="Reset" />
</form>

<p>
	<span class="test-1">{selected1}</span>
	<span class="test-2">{selected2}</span>
	<span class="test-3">{selected3}</span>
</p>
