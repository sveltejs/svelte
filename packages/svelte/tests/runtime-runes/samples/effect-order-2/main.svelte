<script>
	import { log } from './log.js';
	let a = $state(1);
	let b = $state(1);
	let c = $state(1);

	$effect(() => {
		log.push({ a });
	});

	$effect(() => {
		log.push({ b });
	});

	$effect(() => {
		log.push({ c });
	});

	function increment() {
		b += 1;
		c += 1;
		a += 1;
	}
</script>

<button onclick={increment}>
	increment
</button>
