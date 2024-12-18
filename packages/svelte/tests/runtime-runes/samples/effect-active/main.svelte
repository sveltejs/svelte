<script module>
	const mod = $effect.active()
</script>

<script>
	import { untrack } from 'svelte';

	const foo = $effect.active();
	let bar = $state(false);
	$effect.pre(() => {
		bar = $effect.active();
	});
</script>

<p>{mod}</p>
<p>{foo}</p>
<p>{bar}</p>
<p>{(bar, $effect.active())}</p>
<p>{untrack(() => (bar, $effect.active()))}</p>
