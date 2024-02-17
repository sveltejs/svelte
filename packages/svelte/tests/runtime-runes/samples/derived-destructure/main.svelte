<script>
	import { log } from './log.js';

	let a = $state(0);
	let b = $state(0);
	let c = $state(0);
	const {a: a1, b: b1, c: c1} = $derived({a, b, c});

	$effect(() => {
		log.push('a', a1)
	});

	$effect(() => {
		log.push('b', b1)
	});

	$effect(() => {
		log.push('c', c1)
	});
</script>

<button onclick={() => a++}>{a1}</button>
<button onclick={() => b++}>{b1}</button>
<button onclick={() => c++}>{c1}</button>
