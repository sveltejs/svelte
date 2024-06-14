<script>
	import {untrack} from 'svelte';

	const foo = $effect.tracking();
	let bar = $state(false);
	$effect.pre(() => {
		bar = $effect.tracking();
	});
</script>

<p>{foo}</p>
<p>{bar}</p>
<p>{$effect.tracking()}</p>
<p>{untrack(() => $effect.tracking())}</p>
