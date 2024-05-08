<script>
	function foo() {
		// svelte-ignore non-top-level-reactive-declaration
		$: x = 1;
	}
</script>

<!-- svelte-ignore a11y-something-something -->
<div></div>