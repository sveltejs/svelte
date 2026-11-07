<script>
	import { flushSync } from 'svelte';

	let value = $state(0);
	let inner = $derived(value * 2);
	let outer = $derived(inner + 1);

	export function run() {
		value = 1;
		outer = 999;
		value = 2;
		flushSync();
	}
</script>

<p>{outer}</p>
