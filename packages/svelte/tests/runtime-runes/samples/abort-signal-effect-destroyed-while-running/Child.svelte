<script>
	import { getAbortSignal } from 'svelte';

	let { count } = $props();

	$effect(() => {
		const n = count;
		getAbortSignal().onabort = () => console.log(`aborted ${n}`);
		console.log(`run ${n}`);

		if (n === 1) throw new Error('oops');
	});
</script>
