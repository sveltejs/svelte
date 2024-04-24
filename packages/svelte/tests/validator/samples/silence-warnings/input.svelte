<script context="module">
	let foo;
</script>

<script>
	// svelte-ignore module_script_reactive_declaration
	$: reactive = foo;
</script>

<!-- svelte-ignore css_unused_selector -->
<style>
	.unused {}
</style>
