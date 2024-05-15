<script>
	function foo() {
		// svelte-ignore non-top-level-reactive-declaration
		$: x = 1;
	}
</script>

<!-- svelte-ignore a11y-missing-attribute -->
<div>
	<img src="this-is-fine.jpg">
</div>

<!-- svelte-ignore a11y-misplaced-scope -->
<div scope></div>
