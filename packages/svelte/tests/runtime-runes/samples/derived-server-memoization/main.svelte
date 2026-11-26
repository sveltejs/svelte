<script>
	import { reset, increment, get, count } from './state.svelte.js';

	reset();
	console.log(get());
	increment();
	console.log(get());
	console.log({ count });

	let local_count = 0;

	let s = $state(0);
	let d = $derived.by(() => {
		local_count += 1;
		return s * 2;
	});

	console.log(d);
	console.log(d);
	console.log({ local_count });
</script>
