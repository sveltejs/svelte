<script>
	import { log } from './log.js';

	let x = $state(0);

	const cleanup = $effect.root(() => {
		log.push(x);
		return () => log.push('cleanup');
	});
</script>

<button onclick={() => x++}>{x}</button>
<button onclick={cleanup}>cleanup</button>
