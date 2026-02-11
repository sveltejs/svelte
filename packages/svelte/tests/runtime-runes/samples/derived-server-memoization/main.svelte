<script>
	import { reset, increment, get, count } from './state.svelte.js';

	reset();
	get();
	increment();
	get();

	// non-render-bound deriveds recalculate
	if (count !== 2) {
		throw new Error(`count was ${count}`);
	}

	let local_count = 0;

	let s = $state(0);
	let d = $derived.by(() => {
		local_count += 1;
		return s * 2;
	});

	d;
	d;

	// render-bound deriveds do not
	if (local_count !== 1) {
		throw new Error(`local_count was ${local_count}`);
	}
</script>
