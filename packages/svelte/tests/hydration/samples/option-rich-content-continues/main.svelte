<script>
	let label = $state('hello');
	let count = $state(42);
</script>

<select>
	<!-- this would fail during hydration if rich_option handling is not correct -->
	<option value="a"><span>{label}</span> {label}</option>
	<option value="b">Plain text</option>
</select>
	
<button onclick={() => label = "changed"}></button>
