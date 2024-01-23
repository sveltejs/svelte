<script>
	import { log } from './log.js';

	let a = $state(0);
  let b = $state(0);
  let { a: a2, b: b2 } = $derived({ a, b });

	$effect(() => {
		log.push('a', a2);
	})

	$effect(() => {
		log.push('b', b2);
	})
</script>

<button onclick={() => a++}>a</button>
<button onclick={() => b++}>b</button>
