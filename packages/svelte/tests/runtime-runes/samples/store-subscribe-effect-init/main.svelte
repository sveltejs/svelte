<script>
	import { writable } from 'svelte/store';
	import { log } from './log';

	const count = writable(0);
	let ran = 0;

	$effect(() => {
		$count;
		log.push(++ran);
	});
</script>

<button on:click={() => $count++}>increment</button>
