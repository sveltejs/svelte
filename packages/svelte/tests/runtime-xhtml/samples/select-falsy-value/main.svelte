<script>
	let nonreactive = undefined;
	let reactive = $state();
	let nonreactive_spread = { value: undefined };
	let reactive_spread = $state({ value: undefined });
</script>

<select>
	<option value={undefined}>Default</option>
</select>

<select>
	<option value={nonreactive}>Default</option>
</select>

<select>
	<option value={reactive}>Default</option>
</select>

<select>
	<option {...nonreactive_spread}>Default</option>
</select>

<select>
	<option {...reactive_spread}>Default</option>
</select>
