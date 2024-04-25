<script context="module">
	let foo;
</script>

<!-- svelte-ignore reactive_declaration_module_script -->
<script>
	$: reactive = foo;
</script>
