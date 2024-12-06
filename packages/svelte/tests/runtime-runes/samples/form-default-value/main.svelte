<script>
	let value1 = $state();
	let value2 = $state();
	let value3 = $state();
	let value4 = $state();
	let value5 = $state();
	let value6 = $state();
	let value7 = $state();
	let value8 = $state();
	let value9 = $state(null);
	let value10 = $state(null);
	let value11 = $state(null);
	let value12 = $state(null);
	let value13 = $state(null);
	let value14 = $state(null);
	let value15 = $state(null);
	let value16 = $state(null);
	let value17 = $state('y');
	let value18 = $state('y');
	let value19 = $state('y');
	let value20 = $state('y');
	let value21 = $state('y');
	let value22 = $state('y');
	let value23 = $state('y');
	let value24 = $state('y');

	let checked1 = $state();
	let checked2 = $state();
	let checked3 = $state();
	let checked4 = $state();
	let checked5 = $state(null);
	let checked6 = $state(null);
	let checked7 = $state(null);
	let checked8 = $state(null);
	let checked9 = $state(false);
	let checked10 = $state(false);
	let checked11 = $state(false);
	let checked12 = $state(false);
	let checked13 = $state(true);
	let checked14 = $state(true);
 

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

	<!-- defaultValue=x, value=null -->
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

	<!-- defaultValue=x, value=y -->
	<div class="test-3">
		<input {defaultValue} bind:value={value17} />
		<input {defaultValue} value={value18} />
		<input defaultValue="x" value={value19} />
		<input defaultValue="x" bind:value={value20} />
		<textarea {defaultValue} value={value21}></textarea>
		<textarea {defaultValue} bind:value={value22}></textarea>
		<textarea defaultValue="x" value={value23}></textarea>
		<textarea defaultValue="x" bind:value={value24}></textarea>
	</div>

	<p>Input checked</p>
	<!-- defaultChecked=true, checked=undefined -->
	<div class="test-4">
		<input type="checkbox" {defaultChecked} checked={checked1} />
		<input type="checkbox" {defaultChecked} bind:checked={checked2} />
		<input type="checkbox" defaultChecked checked={checked3} />
		<input type="checkbox" defaultChecked bind:checked={checked4} />
	</div>

	<!-- defaultChecked=true, checked=null -->
	<div class="test-5">
		<input type="checkbox" {defaultChecked} checked={checked5} />
		<input type="checkbox" {defaultChecked} bind:checked={checked6} />
		<input type="checkbox" defaultChecked checked={checked7} />
		<input type="checkbox" defaultChecked bind:checked={checked8} />
	</div>

	<!-- defaultChecked=true, checked=false -->
	<div class="test-6">
		<input type="checkbox" {defaultChecked} checked={checked9} />
		<input type="checkbox" {defaultChecked} bind:checked={checked10} />
		<input type="checkbox" defaultChecked checked={checked11} />
		<input type="checkbox" defaultChecked bind:checked={checked12} />
	</div>

	<!-- defaultChecked=false, checked=true -->
	<div class="test-7">
		<input type="checkbox" defaultChecked={false} checked={checked13} />
		<input type="checkbox" defaultChecked={false} bind:checked={checked14} />
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

	<p>Static values</p>
	<div class="test-14">
		<input value="x" defaultValue="y" />
		<input type="checkbox" checked defaultChecked={false} />
		<textarea defaultValue="y">x</textarea>
	</div>

	<input type="reset" value="Reset" />
</form>

<p>
	Bound values:
	<span class="test-1">{value1} {value3} {value6} {value8}</span>
	<span class="test-2">{value9} {value12} {value14} {value16}</span>
	<span class="test-3">{value17} {value20} {value22} {value24}</span>
	<span class="test-4">{checked2} {checked4}</span>
	<span class="test-5">{checked6} {checked8}</span>
	<span class="test-6">{checked10} {checked12}</span>
	<span class="test-7">{checked14}</span>
	<span class="test-8">{selected1}</span>
	<span class="test-9">{selected2}</span>
	<span class="test-10">{selected3}</span>
	<span class="test-11">{selected4}</span>
	<span class="test-12">{selected5}</span>
	<span class="test-13">{selected6}</span>
</p>
