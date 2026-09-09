<script>
	let name = $state('foo');
	const foo = $derived(name);
	const { length } = $derived(foo);
</script>

<!-- only needed to prevent constant folding, never run -->
<button onclick={() => (name = 'longer')}>{length}</button>
