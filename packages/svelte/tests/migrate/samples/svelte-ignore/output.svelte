<script>
	function foo() {
		// svelte-ignore reactive_declaration_invalid_placement
		$: x = 1;
	}
</script>

<!-- svelte-ignore a11y_something_something -->
<div></div>

<!-- svelte-ignore a11y_something_something, a11y_something_something2 -->
<div></div>