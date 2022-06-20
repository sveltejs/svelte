<script context="module">
	let foo;
</script>

<script>
	// svelte-ignore unused-export-let
	export let unused;
	// svelte-ignore module-script-reactive-declaration
	$: reactive = foo;
</script>

<!-- svelte-ignore css-unused-selector -->
<style>
	.unused {}
</style>
