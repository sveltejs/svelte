<script>
	import { log } from './log.js';

	let a = $state(0);
  let b = $state(0);
	let c = $state(0);
	let d = $state(0);
	let e = $state(true);
  let f = $derived(e ? { a, b } : { a: c, b: d });

	$effect(() => {
		log.push('f', JSON.stringify(f));
	})

	$effect(() => {
		log.push('first', f?.a);
	})

	$effect(() => {
		log.push('second', f?.b);
	})
</script>

<button onclick={() => a++}>a</button>
<button onclick={() => b++}>b</button>
<button onclick={() => c++}>c</button>
<button onclick={() => d++}>d</button>
<button onclick={() => e = !e}>e</button>
