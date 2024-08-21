<script module>
	let foo;
</script>

<script>
	// svelte-ignore reactive_declaration_module_script
	$: reactive = foo;
</script>

<!-- svelte-ignore css_unused_selector -->
<style>
	.unused {}
</style>
