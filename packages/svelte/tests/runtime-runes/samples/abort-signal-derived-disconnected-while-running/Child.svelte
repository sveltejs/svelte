<script>
	import { getAbortSignal } from 'svelte';

	let { count } = $props();

	function run(count) {
		getAbortSignal().onabort = () => console.log(`aborted ${count}`);
		console.log(`run ${count}`);

		if (count === 1) throw new Error('oops');
		return count;
	}

	let value = $derived(run(count));
</script>

<p>{value}</p>
