<script>
	let checked_simple = $state(false);
	let checked_simple_copy = $state(false);
	
	let checked_rest = $state(false);
	let checked_rest_copy = $state(false);
	let rest = $state(() => ({}));
</script>

{checked_simple} {checked_simple_copy}
<input type="checkbox" onchange={() => {checked_simple_copy = checked_simple}} bind:checked={checked_simple} />

{checked_rest} {checked_rest_copy}
<!-- {...rest()} in order to force an isolated render effect -->
<input type="checkbox" onchange={() => {checked_rest_copy = checked_rest}} {...rest()} bind:checked={checked_rest} />
