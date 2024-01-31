<script>
	import { log } from './log.js';

	let x = $state(0);
	let y = $state(0);

	$effect(() => {
		log.push(x);
	});
</script>

<button on:click={() => x++}>{x}</button>
<button on:click={() => y++}>{y}</button>
