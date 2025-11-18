<script>
	import { writable } from 'svelte/store';

	const count = writable(0);

	$effect(() => {
		$inspect.trace('effect');
		$count;
	});
</script>

<button onclick={() => $count += 1}>
	clicks: {$count}
</button>
