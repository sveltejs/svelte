<script>
	let value = $state('one');

	const registry = new Set();

	$effect(() => {
		registry.add(value);
		console.log(`register: ${value}`);

		return () => {
			registry.delete(value);
			console.log(`unregister: ${value}`);
			console.log(`leftover: ${[...registry].join(', ') || 'none'}`);
		};
	});
</script>

<button onclick={() => {
	value = 'two';
	value = 'three';
}}>go</button>
