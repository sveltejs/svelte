<script>
	import { log } from './log.js';

	let a = $state(0);
  let b = $state(0);
	let c = $state(true);
  let d = $derived(c ? [ a, b ] : null);

	$effect(() => {
		log.push('d', d);
	})

	$effect(() => {
		log.push('a', d?.[0]);
	})

	$effect(() => {
		log.push('b', d?.[1]);
	})
</script>

<button onclick={() => a++}>a</button>
<button onclick={() => b++}>b</button>
<button onclick={() => c = !c}>c</button>
