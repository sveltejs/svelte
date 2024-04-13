<script>
	import { log } from './log.js';

	let count = $state(0);

	$effect(() => {
		let double = $derived(count * 2)

		log.push('init ' + double);

		return function() {
			log.push('cleanup ' + double);
			// @ts-expect-error
			log.push(this);
		};
	})
</script>

<button on:click={() => count++ }>Click</button>
