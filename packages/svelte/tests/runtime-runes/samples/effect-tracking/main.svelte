<script>
	import { untrack } from 'svelte';

	const foo = $effect.tracking();
	let bar = $state(false);
	$effect.pre(() => {
		bar = $effect.tracking();
	});
</script>

<p>{foo}</p>
<p>{bar}</p>
<p>{(bar, $effect.tracking())}</p>
<p>{untrack(() => (bar, $effect.tracking()))}</p>
