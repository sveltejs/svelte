<script context="module">
	let foo;
</script>

<!-- svelte-ignore module_script_reactive_declaration -->
<script>
	$: reactive = foo;
</script>
