<script context="module">
	let foo;
</script>

<!-- svelte-ignore unused-export-let module-script-reactive-declaration -->
<script>
	export let unused;
	$: reactive = foo;
</script>
