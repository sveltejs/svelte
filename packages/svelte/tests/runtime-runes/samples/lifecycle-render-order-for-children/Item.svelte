<script>
	import { log } from './log.js';

	let { index, n } = $props();

	function logRender () {
		log.push(`${index}: render ${n}`);
		return index;
	}

	$effect.pre(() => {
		log.push(`${index}: $effect.pre ${n}`);
	});

	$effect(() => {
		log.push(`${index}: $effect ${n}`);
	});
</script>

<li>
	{logRender()}
</li>
