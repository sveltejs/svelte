<script module>
	function foo() {
		const foo = $derived(42);
		return () => foo;
	}
</script>

{foo()()}
