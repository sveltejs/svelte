<script context="module">
	let foo;
</script>

<!-- svelte-ignore module-script-reactive-declaration -->
<script>
	$: reactive = foo;
</script>
