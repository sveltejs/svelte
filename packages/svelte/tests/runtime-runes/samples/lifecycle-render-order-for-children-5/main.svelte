<script>
	import { untrack } from 'svelte';

	let { n = 0 } = $props();
	let i = $state(0);

	function logRender(i) {
		console.log(`render ${i}`);
	}

	$effect.pre(() => {
		console.log(`$effect.pre ${n}`);
		untrack(() => i++)
	});

	$effect.pre(() => {
		console.log('another $effect.pre '+ i);
	})
</script>

<p>{logRender(`n${n}`)}</p>
<p>{logRender(`i${i}`)}</p>
