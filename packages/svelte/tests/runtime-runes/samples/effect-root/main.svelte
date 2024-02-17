<script>
	import { log } from './log.js';

	let x = $state(0);
	let y = $state(0);

	const cleanup = $effect.root(() => {
		$effect(() => {
			log.push(x);
		});

		const nested_cleanup = $effect.root(() => {
			return () => {
				log.push('cleanup 2')	;
			}
		});

		return () => {
			log.push('cleanup 1');
			nested_cleanup();
		}
	});
</script>

<button on:click={() => x++}>{x}</button>
<button on:click={() => y++}>{y}</button>
<button on:click={() => cleanup()}>cleanup</button>
