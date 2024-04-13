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
				log.push('cleanup 2');
			}
		});

		return () => {
			log.push('cleanup 1');
			nested_cleanup();
		}
	});
</script>

<button onclick={() => x++}>{x}</button>
<button onclick={() => y++}>{y}</button>
<button onclick={cleanup}>cleanup</button>
