<script>
	import { onDestroy } from 'svelte';

	let { count } = $props();

	let a = $derived(count * 2);
	let b = $derived(count * 2);
	let c = $derived(count * 2);
	let d = $derived(count * 2);

	$effect.pre(() => () => console.log('effect.pre', a));

	function attachment(_node) {
		return () => console.log('attach', b);
	}

	$effect(() => () => console.log('effect', c));

	onDestroy(() => console.log('onDestroy', d));
</script>

<span {@attach attachment}>a: {a}</span>
<span>b: {b}</span>
<span>c: {c}</span>
<span>d: {d}</span>
