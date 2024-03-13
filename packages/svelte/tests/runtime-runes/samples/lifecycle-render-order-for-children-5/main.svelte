<script>
	import { untrack } from 'svelte';
	import { log } from './log.js';
	let { n = 0 } = $props();
	let i = $state(0);
	function logRender(i) {
		log.push(`render ${i}`);
	}
	$effect.pre(() => {
		log.push(`$effect.pre ${n}`);
		untrack(() => i++)
	});
	$effect.pre(() => {
		log.push('another $effect.pre '+ i);
	})
</script>

<p>{logRender(`n${n}`)}</p>
<p>{logRender(`i${i}`)}</p>
