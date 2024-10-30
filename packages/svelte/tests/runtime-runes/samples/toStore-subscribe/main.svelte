<script>
	import { toStore } from 'svelte/store';

	let count = $state(0);

	const store = toStore(
		() => count,
		(v) => (count = v)
	);

	store.set(1);
</script>

{$store}
