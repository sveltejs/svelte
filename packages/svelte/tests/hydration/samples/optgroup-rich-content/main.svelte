<script>
	let label = $state('hello');
</script>

<select>
	<optgroup label="Fruits">
		<span class="group-header">{label}</span>
		<option value="a"><span>{label}</span> {label}</option>
		<option value="b">Plain option</option>
	</optgroup>
	<optgroup label="Static Group">
		<option value="c">Another option</option>
	</optgroup>
</select>

<button onclick={() => label = "changed"}></button>
