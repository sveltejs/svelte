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

	let group1 = $state();
	let group2 = $state();
	let group3 = $state('a');
	let group4 = $state('a');
	let group5 = $state();
	let group6 = $state();
	let group7 = $state(['a']);
	let group8 = $state(['a']);

	let selected1 = $state();
	let selected2 = $state();
	let selected3 = $state('c');
	let selected4 = $state('c');
	let selected5 = $state();
	let selected6 = $state();
	let selected7 = $state(['c']);
	let selected8 = $state(['c']);

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

	<p>Input group (radio)</p>
	<!-- group with static checked, group=undefined -->
	<div class="test-6">
		<input type="radio" value="a" bind:group={group1} />
		<input type="radio" value="b" bind:group={group1} checked />
		<input type="radio" value="c" bind:group={group1} />
	</div>

	<!-- group with dynamic checked, group=undefined -->
	<div class="test-7">
		<input type="radio" value="a" bind:group={group2} />
		<input type="radio" value="b" bind:group={group2} checked={defaultChecked} />
		<input type="radio" value="c" bind:group={group2} />
	</div>

	<!-- group with static checked, group=something else than default -->
	<div class="test-8">
		<input type="radio" value="a" bind:group={group3} />
		<input type="radio" value="b" bind:group={group3} checked />
		<input type="radio" value="c" bind:group={group3} />
	</div>

	<!-- group with dynamic checked, group=something else than default -->
	<div class="test-9">
		<input type="radio" value="a" bind:group={group4} />
		<input type="radio" value="b" bind:group={group4} checked={defaultChecked} />
		<input type="radio" value="c" bind:group={group4} />
	</div>

	<p>Input group (checkbox)</p>
    <!-- TODO, right now we say "group is undefined -> checked takes precedence";
         that does not work with checkbox groups currently because it requires an empty array.
         What to do? -->
	<!-- group with static checked, group=undefined -->
	<div class="test-10">
		<!-- <input type="checkbox" value="a" bind:group={group5} />
		<input type="checkbox" value="b" bind:group={group5} checked />
		<input type="checkbox" value="c" bind:group={group5} /> -->
	</div>

	<!-- group with dynamic checked, group=undefined -->
	<div class="test-11">
		<!-- <input type="checkbox" value="a" bind:group={group6} />
		<input type="checkbox" value="b" bind:group={group6} checked={defaultChecked} />
		<input type="checkbox" value="c" bind:group={group6} /> -->
	</div>

	<!-- group with static checked, group=something else than default -->
	<div class="test-12">
		<input type="checkbox" value="a" bind:group={group7} />
		<input type="checkbox" value="b" bind:group={group7} checked />
		<input type="checkbox" value="c" bind:group={group7} />
	</div>

	<!-- group with dynamic checked, group=something else than default -->
	<div class="test-13">
		<input type="checkbox" value="a" bind:group={group8} />
		<input type="checkbox" value="b" bind:group={group8} checked={defaultChecked} />
		<input type="checkbox" value="c" bind:group={group8} />
	</div>

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
    <!-- TODO, right now we say "value is undefined -> selected takes precedence";
         that does not work with multiple currently because it requires an empty array.
         What to do? -->
	<!-- select with static checked, value=undefined-->
	<!-- <select multiple bind:value={selected5}>
		<option value="a">A</option>
		<option value="b" selected>B</option>
		<option value="c">C</option>
	</select> -->

	<!-- select with dynamic checked, value=undefined-->
	<!-- <select multiple bind:value={selected6}>
		<option value="a">A</option>
		<option value="b" selected={defaultChecked}>B</option>
		<option value="c">C</option>
	</select> -->

	<!-- select with static checked, value=something else than default-->
	<select multiple bind:value={selected7}>
		<option value="a">A</option>
		<option value="b" selected>B</option>
		<option value="c">C</option>
	</select>

	<!-- select with dynamic checked, value=something else than default-->
	<select multiple bind:value={selected8}>
		<option value="a">A</option>
		<option value="b" selected={defaultChecked}>B</option>
		<option value="c">C</option>
	</select>

	<input type="reset" value="Reset" />
</form>
