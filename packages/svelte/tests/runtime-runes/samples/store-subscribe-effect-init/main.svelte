<script>
	import { untrack } from 'svelte';
	import { writable } from 'svelte/store';
	import { log } from './log';

	const storeCount = writable(0)
	let count = $state(0);

	$effect(() => {
		$storeCount;
		untrack(() => {
			count++;
			log.push(count);
		});
	});
</script>

<button on:click={() => $storeCount++}>increment</button>
