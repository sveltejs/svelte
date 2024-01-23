<script>
	import { log } from './log.js';

	let a = $state(0);
  let b = $state(0);
  let c = $derived({ a, b });

	$effect(() => {
		log.push('c', c);
	})

	$effect(() => {
		log.push('a', c.a);
	})

	$effect(() => {
		log.push('b', c.b);
	})
</script>

<button onclick={() => a++}>a</button>
<button onclick={() => b++}>b</button>
