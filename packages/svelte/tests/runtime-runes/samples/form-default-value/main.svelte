<script>
	let value1 = $state();
	let value2 = $state();
	let value3 = $state();
	let value4 = $state();
	let value5 = $state();
	let value6 = $state();
	let value7 = $state();
	let value8 = $state();
	let value9 = $state('y');
	let value10 = $state('y');
	let value11 = $state('y');
	let value12 = $state('y');
	let value13 = $state('y');
	let value14 = $state('y');
	let value15 = $state('y');
	let value16 = $state('y');

	let checked1 = $state();
	let checked2 = $state();
	let checked3 = $state();
	let checked4 = $state();
	let checked5 = $state(false);
	let checked6 = $state(false);
	let checked7 = $state(false);
	let checked8 = $state(false);
	let checked9 = $state(true);
	let checked10 = $state(true);
 

	let selected1 = $state();
	let selected2 = $state();
	let selected3 = $state('c');
	let selected4 = $state('c');
	let selected5 = $state(['c']);
	let selected6 = $state(['c']);

	let defaultValue = $state('x');
	let defaultChecked = $state(true);
</script>

<form>
	<p>Input/Textarea value</p>
	<!-- defaultValue=x, value=undefined -->
	<div class="test-1">
		<input {defaultValue} bind:value={value1} />
		<input {defaultValue} value={value2} />
		<input defaultValue="x" bind:value={value3} />
		<input defaultValue="x" value={value4} />
		<textarea {defaultValue} value={value5}></textarea>
		<textarea {defaultValue} bind:value={value6}></textarea>
		<textarea defaultValue="x" value={value7}></textarea>
		<textarea defaultValue="x" bind:value={value8}></textarea>
	</div>

	<!-- defaultValue=x, value=y -->
	<div class="test-2">
		<input {defaultValue} bind:value={value9} />
		<input {defaultValue} value={value10} />
		<input defaultValue="x" value={value11} />
		<input defaultValue="x" bind:value={value12} />
		<textarea {defaultValue} value={value13}></textarea>
		<textarea {defaultValue} bind:value={value14}></textarea>
		<textarea defaultValue="x" value={value15}></textarea>
		<textarea defaultValue="x" bind:value={value16}></textarea>
	</div>

	<p>Input checked</p>
	<!-- defaultChecked=true, checked=undefined -->
	<div class="test-3">
		<input type="checkbox" {defaultChecked} checked={checked1} />
		<input type="checkbox" {defaultChecked} bind:checked={checked2} />
		<input type="checkbox" defaultChecked checked={checked3} />
		<input type="checkbox" defaultChecked bind:checked={checked4} />
	</div>

	<!-- defaultChecked=true, checked=false -->
	<div class="test-4">
		<input type="checkbox" {defaultChecked} checked={checked5} />
		<input type="checkbox" {defaultChecked} bind:checked={checked6} />
		<input type="checkbox" defaultChecked checked={checked7} />
		<input type="checkbox" defaultChecked bind:checked={checked8} />
	</div>

	<!-- defaultChecked=false, checked=true -->
	<div class="test-5">
		<input type="checkbox" defaultChecked={false} checked={checked9} />
		<input type="checkbox" defaultChecked={false} bind:checked={checked10} />
	</div>

	<!-- no support for bind:group; too complex + we may deprecate it in favor of bind:checked={get,set} -->

	<p>Select (single)</p>
	<!-- select with static checked, value=undefined-->
	<select bind:value={selected1}>
		<option value="a">A</option>
		<option value="b" selected>B</option>
		<option value="c">C</option>
	</select>

	<!-- select with dynamic checked, value=undefined-->
	<select bind:value={selected2}>
		<option value="a">A</option>
		<option value="b" selected={defaultChecked}>B</option>
		<option value="c">C</option>
	</select>

	<!-- select with static checked, value=something else than default-->
	<select bind:value={selected3}>
		<option value="a">A</option>
		<option value="b" selected>B</option>
		<option value="c">C</option>
	</select>

	<!-- select with dynamic checked, value=something else than default-->
	<select bind:value={selected4}>
		<option value="a">A</option>
		<option value="b" selected={defaultChecked}>B</option>
		<option value="c">C</option>
	</select>

	<p>Select (multiple)</p>
    <!-- There's no possibility to have the selected attribute influence a multi select initially,
	     because we require the value to be an array -->

	<!-- select with static checked, value=something else than default-->
	<select multiple bind:value={selected5}>
		<option value="a">A</option>
		<option value="b" selected>B</option>
		<option value="c">C</option>
	</select>

	<!-- select with dynamic checked, value=something else than default-->
	<select multiple bind:value={selected6}>
		<option value="a">A</option>
		<option value="b" selected={defaultChecked}>B</option>
		<option value="c">C</option>
	</select>

	<input type="reset" value="Reset" />
</form>
