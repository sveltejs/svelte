<script>
	import { log } from './log.js';

	let a = $state(0);
  let b = $state(0);
	let c = $state(0);
	let d = $state(0);
	let e = $state(true);
  let f = $derived(e ? [ a, b ] : [ c, d ]);

	$effect(() => {
		log.push('f', f);
	})

	$effect(() => {
		log.push('first', f?.[0]);
	})

	$effect(() => {
		log.push('second', f?.[1]);
	})
</script>

<button onclick={() => a++}>a</button>
<button onclick={() => b++}>b</button>
<button onclick={() => c++}>c</button>
<button onclick={() => d++}>d</button>
<button onclick={() => e = !e}>e</button>
